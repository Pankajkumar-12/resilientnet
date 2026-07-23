const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    const {
        full_name,
        email,
        password,
        phone,
        role,
        organization
    } = req.body;

    try {

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users
            (full_name, email, password_hash, phone, role, organization)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                full_name,
                email,
                hashedPassword,
                phone,
                role,
                organization
            ]
        );

        res.status(201).json({
            message: "User Registered Successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
            message: "Invalid Password"
            });
        }

        const token = jwt.sign(
    {
        id: user.id,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "24h"
    }
);

res.json({
    message: "Login Successful",
    token,
    user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
    }
});

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};
module.exports = {
    register,
    login
};