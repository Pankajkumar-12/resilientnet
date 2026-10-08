const pool = require("../config/db");

const createLog = async (level, message, source = "System") => {
    try {
        await pool.query(
            `
            INSERT INTO system_logs
                (level, message, source)
            VALUES
                ($1, $2, $3)
            `,
            [level, message, source]
        );
    } catch (error) {
        console.error("Failed to create system log:", error.message);
    }
};

module.exports = {
    createLog
};