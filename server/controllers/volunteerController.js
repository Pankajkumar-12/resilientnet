const pool = require("../config/db");

const getAllVolunteers = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT

                v.id,
                u.id AS user_id,

                u.full_name,
                u.email,
                u.phone,
                u.organization_id,

                v.skills,
                v.availability,

                ST_Y(v.current_location::geometry) AS latitude,
                ST_X(v.current_location::geometry) AS longitude,

                v.last_seen

            FROM volunteers v

            JOIN users u

                ON u.id = v.user_id

            WHERE u.role = 'VOLUNTEER'

            ORDER BY u.full_name
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

const assignVolunteer = async (req, res) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const { id } = req.params;
        const { sos_id } = req.body;

        // Check Volunteer
        const volunteer = await client.query(
            `SELECT * FROM volunteers WHERE id = $1`,
            [id]
        );

        if (volunteer.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Volunteer not found"
            });

        }

        // Check SOS
        const sos = await client.query(
            `SELECT * FROM sos_alerts WHERE id = $1`,
            [sos_id]
        );

        if (sos.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "SOS not found"
            });

        }

        const result = await client.query(
            `
            UPDATE volunteers
            SET

                assigned_sos = $1,
                availability = false,
                last_seen = CURRENT_TIMESTAMP

            WHERE id = $2

            RETURNING *
            `,
            [
                sos_id,
                id
            ]
        );

        await client.query("COMMIT");

        res.json({

            message: "Volunteer assigned successfully",

            volunteer: result.rows[0]

        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({

            message: "Server Error"

        });

    } finally {

        client.release();

    }

};
const getAssignedVolunteers = async (req, res) => {

    try {

        const { sosId } = req.params;

        const result = await pool.query(
            `
            SELECT

                v.id,
                u.full_name,
                u.email,
                u.phone,
                u.organization_id,

                v.skills,
                v.availability,
                v.last_seen

            FROM volunteers v

            JOIN users u
                ON u.id = v.user_id

            WHERE v.assigned_sos = $1

            ORDER BY u.full_name
            `,
            [sosId]
        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {

    getAllVolunteers,
    assignVolunteer,
    getAssignedVolunteers

};