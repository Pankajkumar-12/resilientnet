import { useEffect } from "react";
import api from "../api/api";
import socket from "../services/socket";
import { useEmergency } from "../context/EmergencyContext";

import {
    LocationOn,
    Person,
    Warning,
    AccessTime
} from "@mui/icons-material";

import {
    Box,
    Divider
} from "@mui/material";


import {
    Card,
    CardContent,
    Typography,
    Chip,
    Stack
} from "@mui/material";

const SOSList = () => {

    const { alerts, setAlerts } = useEmergency();

    useEffect(() => {
        fetchSOS();

        let intervalSec = 30;
        try {
            const saved = localStorage.getItem("resilientnet_dashboard_settings");
            if (saved) {
                const settings = JSON.parse(saved);
                if (settings.refreshInterval) intervalSec = parseInt(settings.refreshInterval, 10);
            }
        } catch (e) {}

        const timer = setInterval(() => {
            fetchSOS();
        }, (intervalSec || 30) * 1000);

        socket.on("newSOS", (newAlert) => {
            setAlerts((prevAlerts) => [
                {
                    ...newAlert,
                    sender_name: "Live Alert"
                },
                ...prevAlerts
            ]);
        });

        return () => {
            clearInterval(timer);
            socket.off("newSOS");
        };
    }, []);

    const fetchSOS = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await api.get("/sos", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setAlerts(response.data);

        } catch (error) {
            console.error(error);
        }

    };

    return (

        <div style={{ marginTop: "30px" }}>

            <Typography
                variant="h5"
                sx={{ mb: 2 }}
            >
                Live SOS Alerts
            </Typography>

            <Stack spacing={2}>

                {alerts.map((alert) => (

                    <Card
    id={`sos-${alert.id}`}
    key={alert.id}
    sx={{
        borderRadius: 3,
        borderLeft:
            alert.severity === "HIGH"
                ? "6px solid #d32f2f"
                : alert.severity === "MEDIUM"
                ? "6px solid #f57c00"
                : "6px solid #388e3c"
    }}
>

                        <CardContent>

                         <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
>

    <Typography
        variant="h6"
        fontWeight="bold"
    >
        {alert.category}
    </Typography>

    <Chip
        label={alert.severity}
        color={
            alert.severity === "HIGH"
                ? "error"
                : alert.severity === "MEDIUM"
                ? "warning"
                : "success"
        }
    />

</Box>

<Divider sx={{ my: 2 }} />

<Typography
    variant="body1"
    sx={{ mb: 2 }}
>
    {alert.message}
</Typography>

<Box
    display="flex"
    alignItems="center"
    gap={1}
    mb={1}
>
    <Person fontSize="small" />

    <Typography variant="body2">
        {alert.sender_name}
    </Typography>
</Box>

<Box
    display="flex"
    alignItems="center"
    gap={1}
    mb={1}
>
    <Warning fontSize="small" />

    <Typography variant="body2">
        Status : {alert.status}
    </Typography>
</Box>

<Box
    display="flex"
    alignItems="center"
    gap={1}
>
    <AccessTime fontSize="small" />

    <Typography variant="body2">
        {new Date(alert.created_at).toLocaleString()}
    </Typography>
</Box>

                        </CardContent>

                    </Card>

                ))}

            </Stack>

        </div>

    );

};

export default SOSList;