import { io } from "socket.io-client";

const getSocketUrl = () => {
    if (typeof window !== "undefined") {
        const host = window.location.hostname;
        if (host && host !== "localhost" && host !== "127.0.0.1") {
            return `${window.location.protocol}//${host}:5000`;
        }
    }
    return import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
};

const socket = io(getSocketUrl());

export default socket;