const pool = require("../config/db");

const getSystemLogs = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                level,
                message,
                source,
                created_at
            FROM system_logs
            ORDER BY created_at DESC
            LIMIT 100
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Failed to fetch system logs:", error);

        res.status(500).json({
            message: "Failed to fetch system logs"
        });
    }
};

module.exports = {
    getSystemLogs
};