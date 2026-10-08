const pool = require("../config/db");

const getActivityLogs = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.id,
                a.action,
                a.description,
                a.entity_type,
                a.entity_id,
                a.created_at,
                u.full_name AS user_name,
                u.email AS user_email
            FROM activity_logs a
            LEFT JOIN users u
                ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT 100
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Failed to fetch activity logs:", error);

        res.status(500).json({
            message: "Failed to fetch activity logs"
        });
    }
};

module.exports = {
    getActivityLogs
};