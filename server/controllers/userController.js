const pool = require("../config/db");

const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, full_name, email, role, organization FROM users"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};

module.exports = {
    getAllUsers
};