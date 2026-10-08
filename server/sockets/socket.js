let io;

const initializeSocket = (server) => {
    const { Server } = require("socket.io");

    io = new Server(server, {
        cors: {
            origin: true,
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Client Connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("Client Disconnected:", socket.id);
        });
    });
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }

    return io;
};

module.exports = {
    initializeSocket,
    getIO
};