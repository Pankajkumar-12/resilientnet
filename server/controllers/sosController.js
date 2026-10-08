const pool = require("../config/db");
const { getIO } = require("../sockets/socket");
const { performAIAnalysis } = require("./aiController");

const createSOS = async (req, res) => {
    const {
        message,
        category,
        severity,
        latitude,
        longitude,
        mesh_message_id
    } = req.body;

    try {

       const result = await pool.query(
    `INSERT INTO sos_reports
    (
        sender_id,
        message,
        category,
        severity,
        status,
        location,
        mesh_message_id
    )
    VALUES
    (
        $1,
        $2,
        $3,
        $4,
        'NEW',
        ST_GeogFromText($5),
        $6
    )
    RETURNING *`,
    [
        req.user.id,
        message,
        category,
        severity,
        `POINT(${longitude} ${latitude})`,
        mesh_message_id
    ]
);
const newSOS = result.rows[0];
await performAIAnalysis(newSOS.id);
const io = getIO();

const sender = await pool.query(
    "SELECT full_name FROM users WHERE id = $1",
    [req.user.id]
);

const response = {
    ...result.rows[0],
    sender_name: sender.rows[0].full_name
};

io.emit("newSOS", response);


res.status(201).json({
    message: "SOS Alert Created Successfully"
});
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

const getAllSOS = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                s.id,
                s.message,
                s.category,
                s.severity,
                s.status,
                s.created_at,

                ST_Y(s.location::geometry) AS latitude,
                ST_X(s.location::geometry) AS longitude,

                u.full_name AS sender_name

            FROM sos_reports s

            JOIN users u
            ON s.sender_id = u.id

            ORDER BY s.created_at DESC
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};
const getDashboardStats = async (req, res) => {
    try {

        const activeSOS = await pool.query(
            "SELECT COUNT(*) FROM sos_reports WHERE status = 'NEW'"
        );

        const volunteers = await pool.query(
            "SELECT COUNT(*) FROM volunteers"
        );

        const resources = await pool.query(
            "SELECT COUNT(*) FROM resources"
        );

        const highPriority = await pool.query(
            "SELECT COUNT(*) FROM sos_reports WHERE severity = 'HIGH'"
        );

        res.json({
            activeSOS: Number(activeSOS.rows[0].count),
            volunteers: Number(volunteers.rows[0].count),
            resources: Number(resources.rows[0].count),
            highPriority: Number(highPriority.rows[0].count)
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};
module.exports = {
    createSOS,
    getAllSOS,
    getDashboardStats
};