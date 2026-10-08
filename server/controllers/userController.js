const pool = require("../config/db");
const { createLog } = require("../utils/logger");
const { createActivityLog } = require("../utils/activityLogger");

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                full_name,
                email,
                phone,
                role,
                status,
                organization_id,
                created_at,
                updated_at
            FROM users
            ORDER BY created_at DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};


// Update user
const updateUser = async (req, res) => {
    const { id } = req.params;

    const {
        full_name,
        email,
        phone,
        role,
        status,
        organization_id
    } = req.body;
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, email, phone, role, status, organization_id } = req.body;

    // Only administrators can change user roles
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({
            message: "Only administrators can change user roles"
        });
    }

    try {
        const result = await pool.query(`
            UPDATE users SET
                full_name=$1,
                email=$2,
                phone=$3,
                role=$4,
                status=$5,
                organization_id=$6,
                updated_at=CURRENT_TIMESTAMP
            WHERE id=$7
            RETURNING id,full_name,email,phone,role,status,
                      organization_id,created_at,updated_at
        `, [
            full_name,
            email,
            phone,
            role,
            status,
            organization_id,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const updatedUser = result.rows[0];

        await createLog(
            "INFO",
            `User ${updatedUser.full_name} was updated`,
            "User Management"
        );

        await createActivityLog({
            userId: req.user.id || req.user.user_id,
            action: "UPDATE_USER",
            description: `Updated user ${updatedUser.full_name}`,
            entityType: "USER",
            entityId: updatedUser.id
        });

        res.json({
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update user error:", error);

        res.status(500).json({
            message: "Failed to update user"
        });
    }
};
    try {
        // Get current user data before updating
        const existingUser = await pool.query(
            `
            SELECT
                id,
                full_name,
                role,
                status
            FROM users
            WHERE id = $1
            `,
            [id]
        );

        if (existingUser.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const oldUser = existingUser.rows[0];

        const result = await pool.query(
            `
            UPDATE users
            SET
                full_name = $1,
                email = $2,
                phone = $3,
                role = $4,
                status = $5,
                organization_id = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING
                id,
                full_name,
                email,
                phone,
                role,
                status,
                organization_id,
                created_at,
                updated_at
            `,
            [
                full_name,
                email,
                phone,
                role,
                status,
                organization_id,
                id
            ]
        );

        const updatedUser = result.rows[0];

        // System log
        await createLog(
            "INFO",
            `User ${updatedUser.full_name} was updated`,
            "User Management"
        );

        // Role change audit
        if (oldUser.role !== updatedUser.role) {
            await createActivityLog({
                userId: req.user.id || req.user.user_id,
                action: "CHANGE_ROLE",
                description:
                    `Changed ${updatedUser.full_name} role from ${oldUser.role} to ${updatedUser.role}`,
                entityType: "USER",
                entityId: updatedUser.id
            });
        } else {
            // Normal user update audit
            await createActivityLog({
                userId: req.user.id || req.user.user_id,
                action: "UPDATE_USER",
                description:
                    `Updated user ${updatedUser.full_name}`,
                entityType: "USER",
                entityId: updatedUser.id
            });
        }

        res.json({
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update user error:", error);

        res.status(500).json({
            message: "Failed to update user"
        });
    }
};


// Change user status
const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = await pool.query(
            `
            UPDATE users
            SET
                status = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING
                id,
                full_name,
                email,
                phone,
                role,
                status,
                organization_id,
                created_at,
                updated_at
            `,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const updatedUser = result.rows[0];

        // System log
        await createLog(
            "INFO",
            `User ${updatedUser.full_name} status changed to ${updatedUser.status}`,
            "User Management"
        );

        // Activity / Audit log
        await createActivityLog({
            userId: req.user.id || req.user.user_id,
            action: "CHANGE_USER_STATUS",
            description: `Changed ${updatedUser.full_name} status to ${updatedUser.status}`,
            entityType: "USER",
            entityId: updatedUser.id
        });

        res.json({
            message: "User status updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update user status error:", error);

        res.status(500).json({
            message: "Failed to update user status"
        });
    }
};


module.exports = {
    getAllUsers,
    updateUser,
    updateUserStatus
};