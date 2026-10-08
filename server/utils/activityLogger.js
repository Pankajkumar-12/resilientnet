const pool = require("../config/db");

const createActivityLog = async ({
    userId,
    action,
    description,
    entityType = null,
    entityId = null
}) => {
    try {
        await pool.query(
            `
            INSERT INTO activity_logs
            (
                user_id,
                action,
                description,
                entity_type,
                entity_id
            )
            VALUES ($1, $2, $3, $4, $5)
            `,
            [
                userId,
                action,
                description,
                entityType,
                entityId
            ]
        );
    } catch (error) {
        console.error(
            "Failed to create activity log:",
            error.message
        );
    }
};

module.exports = {
    createActivityLog
};