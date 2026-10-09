import { useState } from "react";
import { useEffect } from "react";
import { useEmergency } from "../context/EmergencyContext";
import socket from "../services/socket";

import {
    Badge,
    IconButton,
    Menu,
    MenuItem,
    Typography
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";

const NotificationMenu = () => {

    const [anchorEl, setAnchorEl] = useState(null);

const { notifications, setNotifications } = useEmergency();
    useEffect(() => {

    socket.on("newSOS", (data) => {
        try {
            const saved = localStorage.getItem("resilientnet_dashboard_settings");
            if (saved) {
                const settings = JSON.parse(saved);
                if (settings.notifications === false) {
                    return; // Notifications disabled in dashboard settings
                }
            }
        } catch (e) {}

        setNotifications((prev) => [
            {
                id: data.id,
                title: data.category,
                message: data.message
            },
            ...prev
        ]);
    });

    return () => {
        socket.off("newSOS");
    };

}, []);
    return (
        <>
            <IconButton
                color="inherit"
                onClick={(e) => setAnchorEl(e.currentTarget)}
            >
                <Badge
                    badgeContent={notifications.length}
                    color="error"
                >
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                {notifications.map((notification, index) => (
                    <MenuItem
    key={index}
    onClick={() => {

        setAnchorEl(null);

        const card = document.getElementById(
            `sos-${notification.id}`
        );

        if (card) {
            card.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

    }}
>
                        <Typography variant="body2">
                            <>
    <Typography fontWeight="bold">
        {notification.title}
    </Typography>

    <Typography variant="body2">
        {notification.message}
    </Typography>
</>
                        </Typography>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default NotificationMenu;