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
    Chip,
    Divider
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationMenu from "./NotificationMenu";

const getRoleConfig = (role) => {
    const r = (role || "").toUpperCase();
    if (r === "ADMIN") {
        return {
            label: "Administrator",
            color: "#7c3aed",
            bgColor: "#f3e8ff",
            icon: <SecurityIcon sx={{ fontSize: 14 }} />
        };
    }
    if (r === "AUTHORITY") {
        return {
            label: "Authority",
            color: "#0284c7",
            bgColor: "#e0f2fe",
            icon: <LocalPoliceIcon sx={{ fontSize: 14 }} />
        };
    }
    return {
        label: "Volunteer",
        color: "#16a34a",
        bgColor: "#dcfce7",
        icon: <VolunteerActivismIcon sx={{ fontSize: 14 }} />
    };
};

const Navbar = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

    const user = (() => {
        try {
            const saved = localStorage.getItem("user");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    })();

    const handleLogout = () => {
        setAnchorEl(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const roleConfig = getRoleConfig(user?.role);

    return (
        <AppBar
            position="static"
            elevation={1}
            sx={{
                backgroundColor: "#ffffff",
                color: "#0f172a",
                borderBottom: "1px solid #e2e8f0"
            }}
        >
            <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 } }}>
                <Typography
                    variant="h6"
                    sx={{
                        flexGrow: 1,
                        fontWeight: "bold",
                        letterSpacing: -0.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1
                    }}
                >
                    ResilientNet <span style={{ color: "#1976d2", fontWeight: 500, fontSize: "0.95rem" }}>| Emergency Operations</span>
                </Typography>

                {user && user.role?.toUpperCase() === "ADMIN" && (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SecurityIcon />}
                        sx={{
                            mr: 2,
                            textTransform: "none",
                            fontWeight: "bold",
                            borderColor: "#7c3aed",
                            color: "#7c3aed",
                            "&:hover": { borderColor: "#6d28d9", backgroundColor: "#f5f3ff" }
                        }}
                        onClick={() => navigate("/admin")}
                    >
                        Admin Dashboard
                    </Button>
                )}

                <NotificationMenu />

                {user ? (
                    <Box sx={{ ml: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                        {/* Role Chip Pill visible on toolbar */}
                        <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1 }}>
                            <Box sx={{ textAlign: "right" }}>
                                <Typography variant="body2" fontWeight="bold" lineHeight={1.2}>
                                    {user.full_name || user.email}
                                </Typography>
                                {user.organization_name && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {user.organization_name}
                                    </Typography>
                                )}
                            </Box>

                            <Chip
                                icon={roleConfig.icon}
                                label={roleConfig.label}
                                size="small"
                                sx={{
                                    fontWeight: "bold",
                                    color: roleConfig.color,
                                    backgroundColor: roleConfig.bgColor,
                                    "& .MuiChip-icon": { color: roleConfig.color }
                                }}
                            />
                        </Box>

                        <IconButton
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            size="small"
                            sx={{ p: 0.5 }}
                        >
                            <Avatar sx={{ bgcolor: roleConfig.color, width: 36, height: 36, fontSize: "0.95rem" }}>
                                {(user.full_name || user.email || "U")[0].toUpperCase()}
                            </Avatar>
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                            PaperProps={{
                                sx: { minWidth: 220, borderRadius: 2, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }
                            }}
                        >
                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {user.full_name || user.email}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {user.email}
                                </Typography>
                                {user.organization_name && (
                                    <Typography variant="caption" color="#0284c7" display="block" fontWeight="500">
                                        Agency: {user.organization_name}
                                    </Typography>
                                )}
                                <Box sx={{ mt: 1 }}>
                                    <Chip
                                        icon={roleConfig.icon}
                                        label={roleConfig.label}
                                        size="small"
                                        sx={{
                                            fontWeight: "bold",
                                            color: roleConfig.color,
                                            backgroundColor: roleConfig.bgColor,
                                            "& .MuiChip-icon": { color: roleConfig.color }
                                        }}
                                    />
                                </Box>
                            </Box>

                            <Divider />

                            {user.role?.toUpperCase() === "ADMIN" && (
                                <MenuItem onClick={() => { setAnchorEl(null); navigate("/admin"); }}>
                                    <SecurityIcon sx={{ fontSize: 18, mr: 1, color: "#7c3aed" }} />
                                    Admin Dashboard
                                </MenuItem>
                            )}

                            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                                <LogoutIcon sx={{ fontSize: 18, mr: 1 }} />
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <Box sx={{ ml: 2, display: "flex", gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ textTransform: "none", fontWeight: "bold" }}
                            onClick={() => navigate("/login")}
                        >
                            Sign In
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            sx={{ textTransform: "none", fontWeight: "bold", backgroundColor: "#1976d2" }}
                            onClick={() => navigate("/register")}
                        >
                            Register
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;