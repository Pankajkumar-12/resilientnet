const pool = require("../config/db");
const { getIO } = require("../sockets/socket");
const { performAIAnalysis } = require("./aiController");
const { createActivityLog } = require("../utils/activityLogger");

/**
 * Normalizes Android emergencyType / category into standard TitleCase category.
 */
function normalizeCategory(type) {
    if (!type || typeof type !== "string") return "Other";
    const cleaned = type.trim().toUpperCase();
    switch (cleaned) {
        case "MEDICAL":
        case "AMBULANCE":
            return "Medical";
        case "FIRE":
            return "Fire";
        case "FLOOD":
            return "Flood";
        case "BUILDING_COLLAPSE":
        case "COLLAPSE":
            return "Building Collapse";
        case "ROAD_BLOCK":
        case "ROADBLOCK":
            return "Road Block";
        case "ACCIDENT":
            return "Accident";
        case "EARTHQUAKE":
            return "Earthquake";
        default:
            // Capitalize first letter of each word
            return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    }
}

/**
 * Normalizes Android integer priority (0=NORMAL, 1=HIGH, 2=EMERGENCY) or string to HIGH/MEDIUM/LOW.
 */
function normalizeSeverity(priorityOrSeverity) {
    if (priorityOrSeverity === undefined || priorityOrSeverity === null) {
        return "HIGH"; // Default to HIGH for mobile SOS
    }
    if (typeof priorityOrSeverity === "number") {
        if (priorityOrSeverity >= 2) return "HIGH";
        if (priorityOrSeverity === 1) return "MEDIUM";
        return "LOW";
    }
    const str = String(priorityOrSeverity).trim().toUpperCase();
    if (str.includes("EMERG") || str.includes("HIGH") || str === "2") return "HIGH";
    if (str.includes("MED") || str === "1") return "MEDIUM";
    return "LOW";
}

/**
 * Converts epoch timestamp (long/number or string digits) to a JavaScript Date object.
 */
function parseTimestamp(timestamp) {
    if (!timestamp) return new Date();
    if (typeof timestamp === "number") return new Date(timestamp);
    if (typeof timestamp === "string" && /^\d+$/.test(timestamp)) {
        return new Date(Number(timestamp));
    }
    const parsed = new Date(timestamp);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Synchronizes emergency data uploaded by an Android Gateway Node.
 * Endpoint: POST /api/emergency/sync
 */
const syncEmergencyData = async (req, res) => {
    try {
        const {
            gatewayDeviceId,
            timestamp: payloadTimestamp,
            sosAlerts = [],
            messages = []
        } = req.body;

        const deviceId = gatewayDeviceId || "Unknown-Gateway";
        let syncedSosCount = 0;
        let syncedMsgCount = 0;

        let io;
        try {
            io = getIO();
        } catch {
            // Socket.io not initialized or offline
        }

        // 1. Process SOS Alerts
        if (Array.isArray(sosAlerts) && sosAlerts.length > 0) {
            for (const sos of sosAlerts) {
                const category = normalizeCategory(sos.category || sos.emergencyType);
                const message = sos.message || `Emergency reported via mobile node (${category})`;
                const severity = normalizeSeverity(sos.severity || sos.priority);
                const lat = Number(sos.latitude);
                const lng = Number(sos.longitude);
                const createdAt = parseTimestamp(sos.timestamp || payloadTimestamp);
                const meshId = sos.messageId || sos.meshMessageId || `${deviceId}-sos-${sos.localId || Date.now()}`;

                // Check if already synced (Idempotency)
                const existing = await pool.query(
                    "SELECT id FROM sos_reports WHERE mesh_message_id = $1",
                    [meshId]
                );

                if (existing.rows.length > 0) {
                    syncedSosCount++;
                    continue;
                }

                // Insert new SOS alert
                let insertResult;
                if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                    insertResult = await pool.query(
                        `INSERT INTO sos_reports
                        (
                            message,
                            category,
                            severity,
                            status,
                            location,
                            mesh_message_id,
                            created_at
                        )
                        VALUES
                        (
                            $1,
                            $2,
                            $3,
                            'NEW',
                            ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography,
                            $6,
                            $7
                        )
                        RETURNING id, message, category, severity, status, created_at, mesh_message_id`,
                        [message, category, severity, lng, lat, meshId, createdAt]
                    );
                } else {
                    insertResult = await pool.query(
                        `INSERT INTO sos_reports
                        (
                            message,
                            category,
                            severity,
                            status,
                            mesh_message_id,
                            created_at
                        )
                        VALUES ($1, $2, $3, 'NEW', $4, $5)
                        RETURNING id, message, category, severity, status, created_at, mesh_message_id`,
                        [message, category, severity, meshId, createdAt]
                    );
                }

                const newAlert = insertResult.rows[0];
                syncedSosCount++;

                // Trigger AI Analysis in background
                try {
                    await performAIAnalysis(newAlert.id);
                } catch (aiErr) {
                    console.error("AI Analysis warning during sync:", aiErr.message);
                }

                // Broadcast live to Web Dashboard
                if (io) {
                    io.emit("newSOS", {
                        ...newAlert,
                        latitude: !isNaN(lat) ? lat : null,
                        longitude: !isNaN(lng) ? lng : null,
                        sender_name: `Gateway (${deviceId.slice(0, 8)})`
                    });
                }

                // Log in sync_logs
                try {
                    await pool.query(
                        `INSERT INTO sync_logs
                        (device_id, mesh_message_id, sync_status, created_at, synced_at)
                        VALUES ($1, $2, 'SYNCED', $3, CURRENT_TIMESTAMP)`,
                        [deviceId, meshId, createdAt]
                    );
                } catch {
                    // Ignore duplicate sync_log entry
                }
            }
        }

        // 2. Process Messages
        if (Array.isArray(messages) && messages.length > 0) {
            for (const msg of messages) {
                const meshId = msg.messageId || `${deviceId}-msg-${Date.now()}`;
                const createdAt = parseTimestamp(msg.timestamp || payloadTimestamp);

                // Check if this message is a duplicated SOS from the current payload's sosAlerts
                const isDuplicateOfPayloadSos = Array.isArray(sosAlerts) && sosAlerts.some(s => {
                    if (!s) return false;
                    const sosMsg = (s.message || "").trim();
                    const sosType = (s.emergencyType || s.category || "").trim();
                    const msgContent = (msg.content || "").trim();
                    return (sosMsg && msgContent.includes(sosMsg)) ||
                           (sosType && msgContent.toLowerCase().startsWith(sosType.toLowerCase()));
                });

                // If message is an SOS or urgent message, ensure it's logged ONLY if it's not a duplicate
                if (!isDuplicateOfPayloadSos && (msg.messageType === "SOS" || msg.priority >= 2) && msg.content) {
                    const existing = await pool.query(
                        `SELECT id FROM sos_reports 
                         WHERE mesh_message_id = $1 
                            OR (created_at >= $2 - INTERVAL '60 seconds' 
                                AND created_at <= $2 + INTERVAL '60 seconds'
                                AND ($3 ILIKE '%' || message || '%' OR message ILIKE '%' || $3 || '%'))`,
                        [meshId, createdAt, msg.content.trim()]
                    );

                    if (existing.rows.length === 0) {
                        const lat = Number(msg.latitude);
                        const lng = Number(msg.longitude);
                        const category = "Mobile Mesh Alert";
                        const severity = normalizeSeverity(msg.priority);

                        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                            await pool.query(
                                `INSERT INTO sos_reports
                                (message, category, severity, status, location, mesh_message_id, created_at)
                                VALUES ($1, $2, $3, 'NEW', ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6, $7)`,
                                [msg.content, category, severity, lng, lat, meshId, createdAt]
                            );
                        }
                    }
                }

                try {
                    await pool.query(
                        `INSERT INTO sync_logs
                        (device_id, mesh_message_id, sync_status, created_at, synced_at)
                        VALUES ($1, $2, 'SYNCED', $3, CURRENT_TIMESTAMP)`,
                        [deviceId, meshId, createdAt]
                    );
                    syncedMsgCount++;
                } catch {
                    // Ignore duplicate
                }
            }
        }

        // 3. Log Activity for the Admin Dashboard
        if (syncedSosCount > 0 || syncedMsgCount > 0) {
            await createActivityLog({
                action: "MOBILE_GATEWAY_SYNC",
                description: `Gateway ${deviceId.slice(0, 8)} synced ${syncedSosCount} SOS alerts and ${syncedMsgCount} mesh packets.`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Emergency sync processed successfully",
            syncedSos: syncedSosCount,
            syncedMessages: syncedMsgCount,
            gatewayDeviceId: deviceId,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error("Sync error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process emergency sync: " + error.message
        });
    }
};

module.exports = {
    syncEmergencyData
};
