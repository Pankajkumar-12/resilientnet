require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const pool = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const sosRoutes = require("./routes/sosRoutes");
const http = require("http");
const { initializeSocket } = require("./sockets/socket");
const cors = require("cors");
const resourceRoutes = require("./routes/resourceRoutes");
const aiRoutes = require("./routes/aiRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const logRoutes = require("./routes/logRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const syncRoutes = require("./routes/syncRoutes");

const app = express();
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
const server = http.createServer(app);

const PORT = 5000;



app.use("/api/sos", sosRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/volunteers", volunteerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/emergency/sync", syncRoutes);
app.use("/api/sync", syncRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to ResilientNet Backend API");
});
pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.error("Database Connection Failed!");
        console.error(err.message);
    } else {
        console.log("Database Connected Successfully!");
        console.log("Current Database Time:", result.rows[0].now);
    }
});


initializeSocket(server);

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});

if (PORT !== 8080) {
    const server8080 = http.createServer(app);
    server8080.listen(8080, "0.0.0.0", () => {
        console.log("Compatibility server listening on port 8080");
    }).on("error", (err) => {
        console.log("Port 8080 listener skipped:", err.message);
    });
}