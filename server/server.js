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


const app = express();
app.use(cors({
    origin: "http://localhost:5173",
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

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});