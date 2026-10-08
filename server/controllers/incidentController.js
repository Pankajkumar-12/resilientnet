const pool = require("../config/db");

// Create incident
const createIncident = async (req, res) => {
    try {
        const {
            incident_number,
            title,
            description,
            category,
            severity,
            status,
            location
        } = req.body;

        if (!title || !category || !severity || !location) {
            return res.status(400).json({
                message: "Title, category, severity and location are required"
            });
        }

        const createdBy = req.user.id || req.user.user_id;

        if (!createdBy) {
            return res.status(400).json({
                message: "User ID not found in authentication token"
            });
        }

        const result = await pool.query(
            `INSERT INTO incidents
                (
                    incident_number,
                    title,
                    description,
                    category,
                    severity,
                    status,
                    location,
                    created_by
                )
             VALUES
                (
                    COALESCE($1, 'INC-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))),
                    $2,
                    $3,
                    $4,
                    $5,
                    COALESCE($6, 'OPEN'),
                    ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography,
                    $9
                )
             RETURNING
                id,
                incident_number,
                title,
                description,
                category,
                severity,
                status,
                ST_AsText(location) AS location,
                report_count,
                created_by,
                verified_by,
                resolved_at,
                created_at,
                updated_at`,
            [
                incident_number || null,
                title,
                description || null,
                category,
                severity,
                status || null,
                location.longitude,
                location.latitude,
                createdBy
            ]
        );

        res.status(201).json({
            message: "Incident created successfully",
            incident: result.rows[0]
        });
    } catch (error) {
        console.error("Create incident error:", error);

        res.status(500).json({
            message: "Failed to create incident"
        });
    }
};


// Get all incidents
const getIncidents = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                id,
                incident_number,
                title,
                description,
                category,
                severity,
                status,
                ST_AsText(location) AS location,
                report_count,
                created_by,
                verified_by,
                resolved_at,
                created_at,
                updated_at
             FROM incidents
             ORDER BY created_at DESC`
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Get incidents error:", error);

        res.status(500).json({
            message: "Failed to fetch incidents"
        });
    }
};


// Get incident by ID
const getIncidentById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                id,
                incident_number,
                title,
                description,
                category,
                severity,
                status,
                ST_AsText(location) AS location,
                report_count,
                created_by,
                verified_by,
                resolved_at,
                created_at,
                updated_at
             FROM incidents
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Get incident error:", error);

        res.status(500).json({
            message: "Failed to fetch incident"
        });
    }
};


// Update incident
const updateIncident = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            category,
            severity,
            status,
            location
        } = req.body;

        let query;
        let values;

        if (location) {
            query = `
                UPDATE incidents
                SET
                    title = COALESCE($1, title),
                    description = COALESCE($2, description),
                    category = COALESCE($3, category),
                    severity = COALESCE($4, severity),
                    status = COALESCE($5, status),
                    location = ST_SetSRID(
                        ST_MakePoint($6, $7),
                        4326
                    )::geography,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $8
                RETURNING
                    id,
                    incident_number,
                    title,
                    description,
                    category,
                    severity,
                    status,
                    ST_AsText(location) AS location,
                    report_count,
                    created_by,
                    verified_by,
                    resolved_at,
                    created_at,
                    updated_at
            `;

            values = [
                title,
                description,
                category,
                severity,
                status,
                location.longitude,
                location.latitude,
                id
            ];
        } else {
            query = `
                UPDATE incidents
                SET
                    title = COALESCE($1, title),
                    description = COALESCE($2, description),
                    category = COALESCE($3, category),
                    severity = COALESCE($4, severity),
                    status = COALESCE($5, status),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $6
                RETURNING
                    id,
                    incident_number,
                    title,
                    description,
                    category,
                    severity,
                    status,
                    ST_AsText(location) AS location,
                    report_count,
                    created_by,
                    verified_by,
                    resolved_at,
                    created_at,
                    updated_at
            `;

            values = [
                title,
                description,
                category,
                severity,
                status,
                id
            ];
        }

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

        res.status(200).json({
            message: "Incident updated successfully",
            incident: result.rows[0]
        });
    } catch (error) {
        console.error("Update incident error:", error);

        res.status(500).json({
            message: "Failed to update incident"
        });
    }
};


// Delete incident
const deleteIncident = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM incidents
             WHERE id = $1
             RETURNING id, incident_number`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

        res.status(200).json({
            message: "Incident deleted successfully",
            incident: result.rows[0]
        });
    } catch (error) {
        console.error("Delete incident error:", error);

        res.status(500).json({
            message: "Failed to delete incident",
            error: error.message

        });
    }
};


module.exports = {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncident,
    deleteIncident
};