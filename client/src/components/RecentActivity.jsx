import { Card, CardContent, Typography } from "@mui/material";

const RecentActivity = () => {
    return (
        <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                    Recent Activity
                </Typography>

                <Typography color="text.secondary">
                    No recent activity.
                </Typography>
            </CardContent>
        </Card>
    );
};

export default RecentActivity;