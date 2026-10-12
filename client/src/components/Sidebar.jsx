import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Drawer,
    Toolbar,
    Typography,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Card,
    CardContent
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import WarningIcon from "@mui/icons-material/Warning";
import InventoryIcon from "@mui/icons-material/Inventory";
import GroupsIcon from "@mui/icons-material/Groups";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";

import api from "../services/api";

const drawerWidth = 250;

const Sidebar = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("user");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        const handleStorage = () => {
            try {
                const saved = localStorage.getItem("user");
                setUser(saved ? JSON.parse(saved) : null);
            } catch {
                setUser(null);
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    // Dialog state
    const [dialogType, setDialogType] = useState(null); // 'resources' | 'volunteers' | 'ai' | 'reports' | null
    const [dialogLoading, setDialogLoading] = useState(false);
    const [dialogData, setDialogData] = useState(null);
    const [dialogError, setDialogError] = useState("");

    const openDialog = async (type) => {
        setDialogType(type);
        setDialogLoading(true);
        setDialogError("");
        setDialogData(null);

        try {
            if (type === "resources") {
                const res = await api.get("/resources");
                setDialogData(res.data);
            } else if (type === "volunteers") {
                const res = await api.get("/volunteers");
                setDialogData(res.data);
            } else if (type === "ai") {
                const res = await api.get("/ai");
                setDialogData(res.data);
            } else if (type === "reports") {
                const res = await api.get("/analytics/dashboard");
                setDialogData(res.data);
            }
        } catch (err) {
            console.error(`Failed to load ${type}:`, err);
            setDialogError(
                err.response?.data?.message ||
                `Failed to fetch ${type}. Please make sure you are logged in.`
            );
        } finally {
            setDialogLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
    };

    return (
        <>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        backgroundColor: "#1E293B",
                        color: "#ffffff",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                    }
                }}
            >
                <Box>
                    <Toolbar sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: "#38bdf8", cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                            ResilientNet
                        </Typography>
                    </Toolbar>

                    <List sx={{ px: 1, py: 2 }}>
                        {/* Dashboard */}
                        <ListItemButton
                            sx={{ borderRadius: 2, mb: 0.5, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        >
                            <ListItemIcon sx={{ color: "#38bdf8", minWidth: 40 }}>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItemButton>

                        {/* SOS Alerts */}
                        <ListItemButton
                            sx={{ borderRadius: 2, mb: 0.5, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}
                            onClick={() => {
                                const section = document.getElementById("sos-list-section");
                                if (section) {
                                    section.scrollIntoView({ behavior: "smooth" });
                                } else {
                                    window.scrollTo({ top: 400, behavior: "smooth" });
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: "#f87171", minWidth: 40 }}>
                                <WarningIcon />
                            </ListItemIcon>
                            <ListItemText primary="SOS Alerts" />
                        </ListItemButton>

                        {/* Resources */}
                        <ListItemButton
                            sx={{ borderRadius: 2, mb: 0.5, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}
                            onClick={() => openDialog("resources")}
                        >
                            <ListItemIcon sx={{ color: "#fbbf24", minWidth: 40 }}>
                                <InventoryIcon />
                            </ListItemIcon>
                            <ListItemText primary="Resources" />
                        </ListItemButton>

                        {/* Volunteers */}
                        <ListItemButton
                            sx={{ borderRadius: 2, mb: 0.5, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}
                            onClick={() => openDialog("volunteers")}
                        >
                            <ListItemIcon sx={{ color: "#34d399", minWidth: 40 }}>
                                <GroupsIcon />
                            </ListItemIcon>
                            <ListItemText primary="Volunteers" />
                        </ListItemButton>

                        {/* AI Analysis */}
                        <ListItemButton
                            sx={{ borderRadius: 2, mb: 0.5, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}
                            onClick={() => openDialog("ai")}
                        >
                            <ListItemIcon sx={{ color: "#c084fc", minWidth: 40 }}>
                                <PsychologyIcon />
                            </ListItemIcon>
                            <ListItemText primary="AI Analysis" />
                        </ListItemButton>

                        {/* Reports */}
                        <ListItemButton
                            sx={{ borderRadius: 2, mb: 0.5, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}
                            onClick={() => openDialog("reports")}
                        >
                            <ListItemIcon sx={{ color: "#60a5fa", minWidth: 40 }}>
                                <AssessmentIcon />
                            </ListItemIcon>
                            <ListItemText primary="Reports" />
                        </ListItemButton>

                        {/* Admin Portal (if Admin) */}
                        {user && user.role?.toUpperCase() === "ADMIN" && (
                            <>
                                <Divider sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.15)" }} />
                                <ListItemButton
                                    sx={{
                                        borderRadius: 2,
                                        mb: 0.5,
                                        backgroundColor: "rgba(56, 189, 248, 0.1)",
                                        "&:hover": { backgroundColor: "rgba(56, 189, 248, 0.2)" }
                                    }}
                                    onClick={() => navigate("/admin")}
                                >
                                    <ListItemIcon sx={{ color: "#38bdf8", minWidth: 40 }}>
                                        <AdminPanelSettingsIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Admin Portal" primaryTypographyProps={{ fontWeight: "bold" }} />
                                </ListItemButton>
                            </>
                        )}
                    </List>
                </Box>

                {/* Footer User Info & Auth */}
                <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)", backgroundColor: "#0f172a" }}>
                    {user ? (
                        <Box>
                            <Typography variant="body2" fontWeight="bold" noWrap>
                                {user.full_name || user.email}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                                {user.role || "User"}
                            </Typography>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<LogoutIcon />}
                                sx={{ mt: 1.5 }}
                                onClick={handleLogout}
                            >
                                Sign Out
                            </Button>
                        </Box>
                    ) : (
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<LoginIcon />}
                            onClick={() => navigate("/login")}
                        >
                            Sign In
                        </Button>
                    )}
                </Box>
            </Drawer>

            {/* INTERACTIVE MODAL DIALOGS */}
            <Dialog
                open={Boolean(dialogType)}
                onClose={() => setDialogType(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #e2e8f0" }}>
                    {dialogType === "resources" && "Emergency Resources"}
                    {dialogType === "volunteers" && "Active Volunteers"}
                    {dialogType === "ai" && "AI Analysis & Prioritization"}
                    {dialogType === "reports" && "Disaster Response Reports & Analytics"}
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {dialogLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                            <CircularProgress />
                        </Box>
                    ) : dialogError ? (
                        <Box py={4} textAlign="center">
                            <Typography color="error" sx={{ mb: 2 }}>{dialogError}</Typography>
                            {!user && (
                                <Button variant="contained" size="small" onClick={() => { setDialogType(null); navigate("/login"); }}>
                                    Go to Login
                                </Button>
                            )}
                        </Box>
                    ) : (
                        <>
                            {/* RESOURCES VIEW */}
                            {dialogType === "resources" && (
                                Array.isArray(dialogData) && dialogData.length > 0 ? (
                                    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
                                        <Table size="small">
                                            <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                                                <TableRow>
                                                    <TableCell><strong>Name</strong></TableCell>
                                                    <TableCell><strong>Category</strong></TableCell>
                                                    <TableCell><strong>Quantity</strong></TableCell>
                                                    <TableCell><strong>Unit</strong></TableCell>
                                                    <TableCell><strong>Status</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {dialogData.map((res) => (
                                                    <TableRow key={res.id}>
                                                        <TableCell>{res.name}</TableCell>
                                                        <TableCell>{res.category}</TableCell>
                                                        <TableCell>{res.quantity}</TableCell>
                                                        <TableCell>{res.unit || "units"}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={res.status}
                                                                size="small"
                                                                color={res.status === "AVAILABLE" ? "success" : "warning"}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography color="text.secondary">No resources available at this time.</Typography>
                                )
                            )}

                            {/* VOLUNTEERS VIEW */}
                            {dialogType === "volunteers" && (
                                Array.isArray(dialogData) && dialogData.length > 0 ? (
                                    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
                                        <Table size="small">
                                            <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                                                <TableRow>
                                                    <TableCell><strong>Volunteer Name</strong></TableCell>
                                                    <TableCell><strong>Email</strong></TableCell>
                                                    <TableCell><strong>Phone</strong></TableCell>
                                                    <TableCell><strong>Skills</strong></TableCell>
                                                    <TableCell><strong>Availability</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {dialogData.map((vol) => (
                                                    <TableRow key={vol.id}>
                                                        <TableCell>{vol.full_name}</TableCell>
                                                        <TableCell>{vol.email}</TableCell>
                                                        <TableCell>{vol.phone || "N/A"}</TableCell>
                                                        <TableCell>{vol.skills || "General Aid"}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={vol.availability || "AVAILABLE"}
                                                                size="small"
                                                                color={vol.availability === "OFFLINE" ? "default" : "success"}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography color="text.secondary">No volunteers registered yet.</Typography>
                                )
                            )}

                            {/* AI ANALYSIS VIEW */}
                            {dialogType === "ai" && (
                                Array.isArray(dialogData) && dialogData.length > 0 ? (
                                    <Box display="flex" flexDirection="column" gap={2}>
                                        {dialogData.map((item) => (
                                            <Card key={item.id} variant="outlined" sx={{ borderRadius: 2 }}>
                                                <CardContent>
                                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                        <Typography variant="h6" fontWeight="bold">
                                                            {item.category || item.predicted_category || "Incident Analysis"}
                                                        </Typography>
                                                        <Chip
                                                            label={`Priority: ${item.priority_score || "N/A"}`}
                                                            color={Number(item.priority_score) >= 70 ? "error" : "warning"}
                                                            size="small"
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" paragraph>
                                                        {item.recommendation}
                                                    </Typography>
                                                    <Box display="flex" gap={1} flexWrap="wrap">
                                                        <Chip label={`Resource: ${item.recommended_resource || "None"}`} size="small" variant="outlined" />
                                                        <Chip label={`Estimated Response: ${item.estimated_response_time || "10 mins"}`} size="small" variant="outlined" />
                                                        <Chip label={`Confidence: ${item.confidence ? `${item.confidence}%` : "100%"}`} size="small" color="primary" variant="outlined" />
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography color="text.secondary">No AI analysis data available yet.</Typography>
                                )
                            )}

                            {/* REPORTS VIEW */}
                            {dialogType === "reports" && dialogData && (
                                <Box>
                                    <Grid container spacing={2} mb={3}>
                                        <Grid item xs={6} sm={3}>
                                            <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#eff6ff" }} elevation={0}>
                                                <Typography variant="caption" color="text.secondary">Total SOS</Typography>
                                                <Typography variant="h5" fontWeight="bold" color="primary">
                                                    {dialogData.summary?.totalSOS ?? 0}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#fef2f2" }} elevation={0}>
                                                <Typography variant="caption" color="text.secondary">Critical (High)</Typography>
                                                <Typography variant="h5" fontWeight="bold" color="error">
                                                    {dialogData.summary?.highPriority ?? 0}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#f0fdf4" }} elevation={0}>
                                                <Typography variant="caption" color="text.secondary">Resources Ready</Typography>
                                                <Typography variant="h5" fontWeight="bold" color="success.main">
                                                    {dialogData.summary?.resourcesAvailable ?? 0}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#faf5ff" }} elevation={0}>
                                                <Typography variant="caption" color="text.secondary">Volunteers</Typography>
                                                <Typography variant="h5" fontWeight="bold" sx={{ color: "#9333ea" }}>
                                                    {(dialogData.summary?.volunteersAvailable ?? 0) + (dialogData.summary?.volunteersBusy ?? 0)}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    {Array.isArray(dialogData.categoryStats) && dialogData.categoryStats.length > 0 && (
                                        <Box mt={2}>
                                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                                                Alerts by Incident Category
                                            </Typography>
                                            <Box display="flex" gap={1} flexWrap="wrap">
                                                {dialogData.categoryStats.map((cat, i) => (
                                                    <Chip
                                                        key={i}
                                                        label={`${cat.category}: ${cat.count}`}
                                                        variant="outlined"
                                                        color="primary"
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDialogType(null)} variant="outlined">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Sidebar;