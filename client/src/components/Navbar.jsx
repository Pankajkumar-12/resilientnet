import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Box,
    Button,
    Menu,
    MenuItem,
    Chip
} from "@mui/material";
import NotificationMenu from "./NotificationMenu";

const Navbar = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

    const user = (() => {
        try {
            const saved = localStorage.getItem("user");
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    })();

    const handleLogout = () => {
        setAnchorEl(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

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

                {user && user.role?.toUpperCase() === "ADMIN" && (
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{ mr: 2 }}
                        onClick={() => navigate("/admin")}
                    >
                        Admin Dashboard
                    </Button>
                )}

                <NotificationMenu />

                {user ? (
                    <Box sx={{ ml: 2, display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            size="small"
                        >
                            <Avatar sx={{ bgcolor: "#1976d2" }}>
                                {(user.full_name || user.email || "U")[0].toUpperCase()}
                            </Avatar>
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                        >
                            <MenuItem disabled>
                                <Typography variant="body2" fontWeight="bold">
                                    {user.full_name || user.email}
                                </Typography>
                            </MenuItem>
                            <MenuItem disabled sx={{ mt: -1 }}>
                                <Chip label={user.role || "USER"} size="small" />
                            </MenuItem>
                            {user.role?.toUpperCase() === "ADMIN" && (
                                <MenuItem onClick={() => { setAnchorEl(null); navigate("/admin"); }}>
                                    Admin Dashboard
                                </MenuItem>
                            )}
                            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <Button
                        variant="contained"
                        size="small"
                        sx={{ ml: 2 }}
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </Button>
                )}

            </Toolbar>
        </AppBar>
    );
};

export default Navbar;