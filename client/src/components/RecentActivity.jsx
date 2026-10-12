import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box, List, ListItem, ListItemText, ListItemIcon, Chip, CircularProgress } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../services/api";

const RecentActivity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);
                const response = await api.get("/activity-logs");
                if (Array.isArray(response.data)) {
                    setActivities(response.data.slice(0, 6));
                }
            } catch (err) {
                console.error("Failed to fetch recent activities:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
        const interval = setInterval(fetchActivities, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card sx={{ borderRadius: 3, height: "100%", boxShadow: 2 }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <HistoryIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                            Recent Activity
                        </Typography>
                    </Box>
                    <Chip label="Live" color="success" size="small" variant="outlined" />
                </Box>

                {loading && activities.length === 0 ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress size={28} />
                    </Box>
                ) : activities.length > 0 ? (
                    <List disablePadding>
                        {activities.map((item) => (
                            <ListItem key={item.id} disableGutters sx={{ py: 1, borderBottom: "1px solid #f0f0f0" }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <CheckCircleIcon color="primary" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.description || item.action}
                                    secondary={
                                        <Typography variant="caption" color="text.secondary">
                                            {item.created_at ? new Date(item.created_at).toLocaleString() : "Just now"}
                                            {item.user_name ? ` • by ${item.user_name}` : ""}
                                        </Typography>
                                    }
                                    primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography color="text.secondary" variant="body2">
                        No recent activity recorded.
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default RecentActivity;