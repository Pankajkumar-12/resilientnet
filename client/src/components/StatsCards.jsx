import { useEffect } from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import api from "../api/api";
import WarningIcon from "@mui/icons-material/Warning";
import GroupsIcon from "@mui/icons-material/Groups";
import InventoryIcon from "@mui/icons-material/Inventory";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { Box } from "@mui/material";
import { useEmergency } from "../context/EmergencyContext";


const StatsCards = () => {
    const { stats, setStats } = useEmergency();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get("/sos/stats", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setStats(response.data);

        } catch (error) {
            console.error(error);
        }
    };

    const cards = [
    {
        title: "Active SOS",
        value: stats.activeSOS,
        color: "#e53935",
        icon: <WarningIcon fontSize="large" />
    },
    {
        title: "Volunteers",
        value: stats.volunteers,
        color: "#1976d2",
        icon: <GroupsIcon fontSize="large" />
    },
    {
        title: "Resources",
        value: stats.resources,
        color: "#2e7d32",
        icon: <InventoryIcon fontSize="large" />
    },
    {
        title: "High Priority",
        value: stats.highPriority,
        color: "#fb8c00",
        icon: <PriorityHighIcon fontSize="large" />
    }
];

    return (
        <Grid container spacing={3}>
            {cards.map((card) => (
<Grid
    size={{
        xs: 12,
        sm: 6,
        md: 3
    }}
    key={card.title}
>                    
<Card
                        sx={{
                            borderLeft: `6px solid ${card.color}`,
                            borderRadius: 3
                        }}
                    >
                        <CardContent>
                            <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
>

    <Box>

        <Typography
            color="text.secondary"
            variant="subtitle2"
        >
            {card.title}
        </Typography>

        <Typography
            variant="h3"
            fontWeight="bold"
        >
            {card.value}
        </Typography>

    </Box>

    <Box
        sx={{
            color: card.color
        }}
    >
        {card.icon}
    </Box>

</Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default StatsCards;