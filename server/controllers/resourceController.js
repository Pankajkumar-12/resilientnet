const pool = require("../config/db");

// Get All Resources
const getAllResources = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT *
            FROM resources
            ORDER BY created_at DESC
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// Get Single Resource
const getResourceById = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `SELECT * FROM resources WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// Create Resource
const createResource = async (req, res) => {

    try {

        const {
            center_id,
            name,
            description,
            category,
            quantity,
            unit,
            latitude,
            longitude,
            status
        } = req.body;

        const result = await pool.query(
            `
            INSERT INTO resources
            (
                center_id,
                name,
                description,
                category,
                quantity,
                unit,
                latitude,
                longitude,
                status
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9
            )
            RETURNING *
            `,
            [
                center_id,
                name,
                description,
                category,
                quantity,
                unit,
                latitude,
                longitude,
                status
            ]
        );

        res.status(201).json({
            message: "Resource created successfully",
            resource: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// Update Resource
const updateResource = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            name,
            description,
            category,
            quantity,
            unit,
            latitude,
            longitude,
            status
        } = req.body;

        const result = await pool.query(
            `
            UPDATE resources
            SET
                name = $1,
                description = $2,
                category = $3,
                quantity = $4,
                unit = $5,
                latitude = $6,
                longitude = $7,
                status = $8,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $9
            RETURNING *;
            `,
            [
                name,
                description,
                category,
                quantity,
                unit,
                latitude,
                longitude,
                status,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.json({
            message: "Resource updated successfully",
            resource: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// Delete Resource
const deleteResource = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM resources
            WHERE id = $1
            RETURNING *;
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.json({
            message: "Resource deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// Assign Resource to SOS
const assignResource = async (req, res) => {

    try {

        const { id } = req.params;

        const { sos_id } = req.body;

        const result = await pool.query(
            `
            UPDATE resources
            SET
                assigned_to = $1,
                status = 'DEPLOYED',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
            `,
            [sos_id, id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Resource not found"
            });

        }

        res.json({
            message: "Resource assigned successfully",
            resource: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// Change Resource Status
const updateResourceStatus = async (req, res) => {

    try {

        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = [
            "AVAILABLE",
            "DEPLOYED",
            "MAINTENANCE",
            "OUT_OF_SERVICE"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid resource status"
            });
        }

        const result = await pool.query(
            `
            UPDATE resources
            SET
                status = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
            `,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.json({
            message: "Resource status updated successfully",
            resource: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// Release Resource
const releaseResource = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            UPDATE resources
            SET
                assigned_to = NULL,
                status = 'AVAILABLE',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *;
            `,
            [id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Resource not found"
            });

        }

        res.json({
            message: "Resource released successfully",
            resource: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {
    getAllResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
    assignResource,
    updateResourceStatus,
    releaseResource
};

 
