const pool = require("../config/db");

// Create organization
const createOrganization = async (req, res) => {
    try {
        const {
            name,
            address,
            phone,
            headquarters_location,
            type,
            email,
            status
        } = req.body;

        if (!name || !type) {
            return res.status(400).json({
                message: "Name and type are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO organizations
                (name, address, phone, headquarters_location, type, email, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                name,
                address || null,
                phone || null,
                headquarters_location || null,
                type,
                email || null,
                status || "active"
            ]
        );

        res.status(201).json({
            message: "Organization created successfully",
            organization: result.rows[0]
        });
    } catch (error) {
        console.error("Create organization error:", error);

        res.status(500).json({
            message: "Failed to create organization"
        });
    }
};


// Get all organizations
const getOrganizations = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM organizations
             ORDER BY created_at DESC`
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Get organizations error:", error);

        res.status(500).json({
            message: "Failed to fetch organizations"
        });
    }
};


// Get organization by ID
const getOrganizationById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM organizations
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Organization not found"
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Get organization error:", error);

        res.status(500).json({
            message: "Failed to fetch organization"
        });
    }
};


// Update organization
const updateOrganization = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            address,
            phone,
            headquarters_location,
            type,
            email,
            status
        } = req.body;

        const result = await pool.query(
            `UPDATE organizations
             SET name = $1,
                 address = $2,
                 phone = $3,
                 headquarters_location = $4,
                 type = $5,
                 email = $6,
                 status = $7,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $8
             RETURNING *`,
            [
                name,
                address,
                phone,
                headquarters_location,
                type,
                email,
                status,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Organization not found"
            });
        }

        res.status(200).json({
            message: "Organization updated successfully",
            organization: result.rows[0]
        });
    } catch (error) {
        console.error("Update organization error:", error);

        res.status(500).json({
            message: "Failed to update organization"
        });
    }
};


// Delete organization
const deleteOrganization = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM organizations
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Organization not found"
            });
        }

        res.status(200).json({
            message: "Organization deleted successfully",
            organization: result.rows[0]
        });
    } catch (error) {
        console.error("Delete organization error:", error);

        res.status(500).json({
            message: "Failed to delete organization"
        });
    }
};


module.exports = {
    createOrganization,
    getOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
};