import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Box
} from "@mui/material";
import NotificationMenu from "./NotificationMenu";
import NotificationsIcon from "@mui/icons-material/Notifications";

const Navbar = () => {
    return (
        <AppBar
            position="static"
            elevation={1}
            sx={{
                backgroundColor: "#ffffff",
                color: "#000"
            }}
        >
            <Toolbar>

                <Typography
                    variant="h5"
                    sx={{
                        flexGrow: 1,
                        fontWeight: "bold"
                    }}
                >
                    Emergency Dashboard
                </Typography>

                <NotificationMenu />

                <Box sx={{ ml: 2 }}>
                    <Avatar sx={{ bgcolor: "#1976d2" }}>
                        A
                    </Avatar>
                </Box>

            </Toolbar>
        </AppBar>
    );
};

export default Navbar;