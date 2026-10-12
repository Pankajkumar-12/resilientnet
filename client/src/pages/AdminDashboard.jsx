import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";
import HistoryIcon from "@mui/icons-material/History";

import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const [activeSection, setActiveSection] = useState("overview");

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [selectedUserId, setSelectedUserId] = useState("");
const [selectedRole, setSelectedRole] = useState("");
const [updatingRole, setUpdatingRole] = useState(false);
const [roleMessage, setRoleMessage] = useState("");
const [roleError, setRoleError] = useState("");
const [dashboardSettings, setDashboardSettings] = useState(() => {
    try {
        const savedSettings = localStorage.getItem("resilientnet_dashboard_settings");
        return savedSettings ? JSON.parse(savedSettings) : {
            refreshInterval: "30",
            mapZoom: "11",
            notifications: true,
        };
    } catch {
        return {
            refreshInterval: "30",
            mapZoom: "11",
            notifications: true,
        };
    }
});

const [settingsMessage, setSettingsMessage] = useState("");
const [systemLogs, setSystemLogs] = useState([]);
const [loadingLogs, setLoadingLogs] = useState(false);
const [logsError, setLogsError] = useState("");
const [activityLogs, setActivityLogs] = useState([]);
const [loadingActivityLogs, setLoadingActivityLogs] = useState(false);
const [activityLogsError, setActivityLogsError] = useState("");

const fetchSystemLogs = async () => {
    try {
        setLoadingLogs(true);
        setLogsError("");

        const response = await api.get("/logs");

        setSystemLogs(response.data);
    } catch (error) {
        console.error(error);

        setLogsError(
            error.response?.data?.message ||
            "Failed to fetch system logs."
        );
    } finally {
        setLoadingLogs(false);
    }
};

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setUserError("");

      const response = await api.get("/users");

      setUsers(response.data);
    } catch (error) {
      console.error(error);

      setUserError(
        error.response?.data?.message || "Failed to load users"
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
        setLoadingActivityLogs(true);
        setActivityLogsError("");

        const response = await api.get("/activity-logs");

        setActivityLogs(response.data);
    } catch (error) {
        console.error(error);

        setActivityLogsError(
            error.response?.data?.message ||
            "Failed to fetch activity logs."
        );
    } finally {
        setLoadingActivityLogs(false);
    }
  };

  useEffect(() => {
    if (activeSection === "users" || activeSection === "roles") {
      fetchUsers();
    }
    if (activeSection === "logs") {
      fetchSystemLogs();
    }
    if (activeSection === "activity" || activeSection === "audit") {
      fetchActivityLogs();
    }
  }, [activeSection]);

  useEffect(() => {
    const intervalSec = parseInt(dashboardSettings.refreshInterval, 10);
    if (!intervalSec || isNaN(intervalSec) || intervalSec <= 0) return;

    const timer = setInterval(() => {
      if (activeSection === "users" || activeSection === "roles") {
        fetchUsers();
      } else if (activeSection === "logs") {
        fetchSystemLogs();
      } else if (activeSection === "activity" || activeSection === "audit") {
        fetchActivityLogs();
      }
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [activeSection, dashboardSettings.refreshInterval]);

const handleSettingsChange = (field, value) => {
    setDashboardSettings((prev) => ({
        ...prev,
        [field]: value,
    }));

    setSettingsMessage("");
};

const handleSaveSettings = () => {
    localStorage.setItem(
        "resilientnet_dashboard_settings",
        JSON.stringify(dashboardSettings)
    );

    setSettingsMessage("Dashboard settings saved successfully.");
};

const handleResetSettings = () => {
    const defaultSettings = {
        refreshInterval: "30",
        mapZoom: "11",
        notifications: true,
    };

    setDashboardSettings(defaultSettings);

    localStorage.setItem(
        "resilientnet_dashboard_settings",
        JSON.stringify(defaultSettings)
    );

    setSettingsMessage("Dashboard settings reset to default.");
};

  const handleStatusChange = async (user, targetStatus = null) => {
    let newStatus;
    if (targetStatus) {
      newStatus = targetStatus;
    } else {
      newStatus = user.status?.toLowerCase() === "active" ? "inactive" : "active";
    }

    try {
      await api.patch(`/users/${user.id}/status`, {
        status: newStatus,
      });

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? { ...item, status: newStatus }
            : item
        )
      );
    } catch (error) {
      console.error(error);

      setUserError(
        error.response?.data?.message ||
          "Failed to update user status"
      );
    }
  };

  const handleRoleUpdate = async () => {
    const selectedUser = users.find(
        (user) => user.id === selectedUserId
    );

    if (!selectedUser) {
        setRoleError("Please select a user.");
        return;
    }

    if (!selectedRole) {
        setRoleError("Please select a role.");
        return;
    }

    try {
        setUpdatingRole(true);
        setRoleError("");
        setRoleMessage("");

        await api.put(`/users/${selectedUser.id}`, {
            full_name: selectedUser.full_name,
            email: selectedUser.email,
            phone: selectedUser.phone,
            role: selectedRole,
            status: selectedUser.status,
            organization_id: selectedUser.organization_id
        });

        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === selectedUser.id
                    ? { ...user, role: selectedRole }
                    : user
            )
        );

        setRoleMessage(
            `Role updated successfully for ${selectedUser.full_name}.`
        );

    } catch (error) {
        console.error(error);

        setRoleError(
            error.response?.data?.message ||
            "Failed to update user role."
        );
    } finally {
        setUpdatingRole(false);
    }
};

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchText) ||
      user.email?.toLowerCase().includes(searchText);

    const matchesRole =
      roleFilter === "ALL" ||
      user.role?.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const standardRoles = ["ADMIN", "VOLUNTEER", "COORDINATOR", "DISPATCHER"];
  const roles = [
    ...new Set([
      ...standardRoles,
      ...users.map((user) => user.role).filter(Boolean)
    ])
  ];

  const adminCards = [
    {
      title: "User Management",
      description: "Manage registered users and their accounts.",
      icon: <PeopleIcon fontSize="large" />,
      action: () => setActiveSection("users"),
    },
    {
      title: "Role Management",
      description: "Manage user roles and access permissions.",
      icon: <SecurityIcon fontSize="large" />,
      action: () => setActiveSection("roles"),
    },
    {
      title: "Dashboard Settings",
      description: "Configure administrative dashboard settings.",
      icon: <SettingsIcon fontSize="large" />,
      action: () => setActiveSection("settings"),
    },
    {
      title: "System Logs",
      description: "Monitor important system activities and events.",
      icon: <HistoryIcon fontSize="large" />,
      action: () => setActiveSection("logs"),
    },
    {
      title: "Activity Logs",
      description: "Track user and administrator actions.",
      icon: <HistoryIcon fontSize="large" />,
      action: () => setActiveSection("activity"),
    },
    {
      title: "Audit Trail",
      description: "Track important system actions.",
      icon: <HistoryIcon fontSize="large" />,
      section: "audit",
      action: () => setActiveSection("audit"),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Admin Dashboard
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage ResilientNet users, roles, system settings and activity records.
          </Typography>

          {currentUser && (
            <Chip
              label={`Logged in as: ${currentUser.full_name || currentUser.email} (${currentUser.role || "ADMIN"})`}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/")}
          >
            Emergency Dashboard
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* ADMIN CARDS */}
      <Grid container spacing={3}>
        {adminCards.map((card) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            key={card.title}
          >
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: 4,
                },
              }}
              onClick={card.action}
            >
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  {card.icon}
                </Box>

                <Typography
                  variant="h6"
                  fontWeight="bold"
                >
                  {card.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
            
          </Grid>
        ))}
      </Grid>

      {/* USER MANAGEMENT */}
      {activeSection === "users" && (
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
          >
            User Management
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            View and manage registered ResilientNet users.
          </Typography>

          {/* SEARCH AND FILTER */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              flexWrap: "wrap",
            }}
          >
            <TextField
              label="Search users"
              placeholder="Name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
            />

            <TextField
              select
              label="Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="ALL">
                All Roles
              </MenuItem>

              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="outlined"
              onClick={fetchUsers}
            >
              Refresh
            </Button>
          </Box>

          {userError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {userError}
            </Alert>
          )}

          {loadingUsers ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: 4,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Name</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Email</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Phone</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Role</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Action</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                      >
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      const isPending = user.status?.toLowerCase() === "pending";
                      const isActive = user.status?.toLowerCase() === "active";
                      const roleUpper = (user.role || "").toUpperCase();

                      return (
                        <TableRow key={user.id} sx={isPending ? { backgroundColor: "#fffbeb" } : {}}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {user.full_name}
                            </Typography>
                            {user.organization_name && (
                              <Typography variant="caption" color="primary.main" display="block">
                                {user.organization_name}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            {user.email}
                          </TableCell>

                          <TableCell>
                            {user.phone || "-"}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={user.role || "-"}
                              size="small"
                              sx={{
                                fontWeight: "bold",
                                color: roleUpper === "ADMIN" ? "#7c3aed" : roleUpper === "AUTHORITY" ? "#0284c7" : "#16a34a",
                                backgroundColor: roleUpper === "ADMIN" ? "#f3e8ff" : roleUpper === "AUTHORITY" ? "#e0f2fe" : "#dcfce7",
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={isPending ? "Pending Approval" : isActive ? "Active" : "Inactive"}
                              size="small"
                              color={isPending ? "warning" : isActive ? "success" : "default"}
                              sx={{ fontWeight: "bold" }}
                            />
                          </TableCell>

                          <TableCell>
                            {isPending ? (
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleStatusChange(user, "active")}
                                  sx={{ textTransform: "none", fontWeight: "bold" }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => handleStatusChange(user, "rejected")}
                                  sx={{ textTransform: "none" }}
                                >
                                  Reject
                                </Button>
                              </Box>
                            ) : (
                              <Button
                                size="small"
                                variant="outlined"
                                color={isActive ? "error" : "primary"}
                                onClick={() => handleStatusChange(user, isActive ? "inactive" : "active")}
                                sx={{ textTransform: "none" }}
                              >
                                {isActive ? "Deactivate" : "Activate"}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
      {/* ROLE MANAGEMENT */}
{activeSection === "roles" && (
    <Box sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
            Role Management
        </Typography>

        <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
        >
            Manage user roles and access permissions.
        </Typography>

        <Card>
            <CardContent>
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                        alignItems: "center"
                    }}
                >
                    <TextField
                        select
                        label="Select User"
                        value={selectedUserId}
                        onChange={(e) => {
                            const userId = e.target.value;
                            setSelectedUserId(userId);

                            const user = users.find(
                                (item) => item.id === userId
                            );

                            setSelectedRole(user?.role || "");
                            setRoleMessage("");
                            setRoleError("");
                        }}
                        sx={{ minWidth: 250 }}
                    >
                        {users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.full_name} — {user.role || "No Role"}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="New Role"
                        value={selectedRole}
                        onChange={(e) => {
                            setSelectedRole(e.target.value);
                            setRoleMessage("");
                            setRoleError("");
                        }}
                        sx={{ minWidth: 200 }}
                    >
                        {roles.map((role) => (
                            <MenuItem key={role} value={role}>
                                {role}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        variant="contained"
                        onClick={handleRoleUpdate}
                        disabled={updatingRole}
                    >
                        {updatingRole ? "Updating..." : "Update Role"}
                    </Button>
                </Box>

                {roleError && (
                    <Alert severity="error" sx={{ mt: 3 }}>
                        {roleError}
                    </Alert>
                )}

                {roleMessage && (
                    <Alert severity="success" sx={{ mt: 3 }}>
                        {roleMessage}
                    </Alert>
                )}
            </CardContent>
        </Card>
    </Box>
)}

{/* DASHBOARD SETTINGS */}
{activeSection === "settings" && (
    <Box sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
            Dashboard Settings
        </Typography>

        <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
        >
            Configure administrative dashboard settings.
        </Typography>

        <Card>
            <CardContent>
                <TextField
                    select
                    fullWidth
                    label="Refresh Interval"
                    value={dashboardSettings.refreshInterval}
                    onChange={(e) =>
                        handleSettingsChange(
                            "refreshInterval",
                            e.target.value
                        )
                    }
                    sx={{ mb: 3 }}
                >
                    <MenuItem value="10">10 seconds</MenuItem>
                    <MenuItem value="30">30 seconds</MenuItem>
                    <MenuItem value="60">60 seconds</MenuItem>
                </TextField>

                <TextField
                    select
                    fullWidth
                    label="Map Zoom"
                    value={dashboardSettings.mapZoom}
                    onChange={(e) =>
                        handleSettingsChange(
                            "mapZoom",
                            e.target.value
                        )
                    }
                    sx={{ mb: 3 }}
                >
                    <MenuItem value="10">10</MenuItem>
                    <MenuItem value="11">11</MenuItem>
                    <MenuItem value="12">12</MenuItem>
                    <MenuItem value="13">13</MenuItem>
                    <MenuItem value="14">14</MenuItem>
                </TextField>

                <TextField
                    select
                    fullWidth
                    label="Notifications"
                    value={dashboardSettings.notifications ? "true" : "false"}
                    onChange={(e) =>
                        handleSettingsChange(
                            "notifications",
                            e.target.value === "true"
                        )
                    }
                    sx={{ mb: 3 }}
                >
                    <MenuItem value="true">Enabled</MenuItem>
                    <MenuItem value="false">Disabled</MenuItem>
                </TextField>

                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                        variant="contained"
                        onClick={handleSaveSettings}
                    >
                        Save Settings
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={handleResetSettings}
                    >
                        Reset
                    </Button>
                </Box>

                {settingsMessage && (
                    <Alert severity="success" sx={{ mt: 3 }}>
                        {settingsMessage}
                    </Alert>
                )}
            </CardContent>
        </Card>
    </Box>
)}

{/* SYSTEM LOGS */}
{activeSection === "logs" && (
    <Box sx={{ mt: 3 }}>
        <Card>
            <CardContent>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography variant="h5" fontWeight="bold">
                        System Logs
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={fetchSystemLogs}
                        disabled={loadingLogs}
                    >
                        {loadingLogs ? "Refreshing..." : "Refresh Logs"}
                    </Button>
                </Box>

                {logsError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {logsError}
                    </Alert>
                )}

                {loadingLogs ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : systemLogs.length === 0 ? (
                    <Alert severity="info">
                        No system logs available.
                    </Alert>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Level</strong></TableCell>
                                    <TableCell><strong>Message</strong></TableCell>
                                    <TableCell><strong>Source</strong></TableCell>
                                    <TableCell><strong>Date & Time</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {systemLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <Chip
                                                label={log.level}
                                                color={
                                                    log.level === "ERROR"
                                                        ? "error"
                                                        : log.level === "WARNING"
                                                        ? "warning"
                                                        : "info"
                                                }
                                                size="small"
                                            />
                                        </TableCell>

                                        <TableCell>
                                            {log.message}
                                        </TableCell>

                                        <TableCell>
                                            {log.source || "System"}
                                        </TableCell>

                                        <TableCell>
                                            {new Date(
                                                log.created_at
                                            ).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CardContent>
        </Card>
    </Box>
)}
{/* AUDIT TRAIL */}
{activeSection === "audit" && (
    <Box sx={{ mt: 3 }}>
        <Card>
            <CardContent>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography variant="h5" fontWeight="bold">
                        Audit Trail
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={fetchActivityLogs}
                        disabled={loadingActivityLogs}
                    >
                        {loadingActivityLogs ? "Refreshing..." : "Refresh"}
                    </Button>
                </Box>

                {activityLogsError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {activityLogsError}
                    </Alert>
                )}

                {loadingActivityLogs ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 5,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : activityLogs.length === 0 ? (
                    <Alert severity="info">
                        No audit records available.
                    </Alert>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <strong>User</strong>
                                    </TableCell>

                                    <TableCell>
                                        <strong>Action</strong>
                                    </TableCell>

                                    <TableCell>
                                        <strong>Description</strong>
                                    </TableCell>

                                    <TableCell>
                                        <strong>Entity</strong>
                                    </TableCell>

                                    <TableCell>
                                        <strong>Date & Time</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {activityLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            {log.user_name || "System"}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={log.action}
                                                size="small"
                                                color="primary"
                                            />
                                        </TableCell>

                                        <TableCell>
                                            {log.description}
                                        </TableCell>

                                        <TableCell>
                                            {log.entity_type || "-"}
                                        </TableCell>

                                        <TableCell>
                                            {new Date(
                                                log.created_at
                                            ).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CardContent>
        </Card>
    </Box>
)}
{/* ACTIVITY LOGS */}
{activeSection === "activity" && (
    <Box sx={{ mt: 4 }}>
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
            }}
        >
            <Box>
                <Typography
                    variant="h5"
                    fontWeight="bold"
                >
                    Activity Logs
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Track user and administrator actions.
                </Typography>
            </Box>

            <Button
                variant="outlined"
                onClick={fetchActivityLogs}
                disabled={loadingActivityLogs}
            >
                {loadingActivityLogs
                    ? "Refreshing..."
                    : "Refresh"}
            </Button>
        </Box>

        {activityLogsError && (
            <Alert
                severity="error"
                sx={{ mb: 2 }}
            >
                {activityLogsError}
            </Alert>
        )}

        <Card>
            <CardContent>
                {loadingActivityLogs ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 5,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : activityLogs.length === 0 ? (
                    <Box
                        sx={{
                            textAlign: "center",
                            py: 5,
                        }}
                    >
                        <Typography color="text.secondary">
                            No activity logs found.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <strong>User</strong>
                                    </TableCell>

                                    <TableCell>
                                        <strong>Action</strong>
                                    </TableCell>

                                    <TableCell>
                                        <strong>Description</strong>
                                    </TableCell>

                                    <TableCell>
                                        <strong>Entity</strong>
                                    </TableCell>

                                    <TableCell>
                                        <strong>Date & Time</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {activityLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            {log.user_name || "System"}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={log.action}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>

                                        <TableCell>
                                            {log.description}
                                        </TableCell>

                                        <TableCell>
                                            {log.entity_type || "-"}
                                        </TableCell>

                                        <TableCell>
                                            {new Date(
                                                log.created_at
                                            ).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CardContent>
        </Card>
    </Box>
)}
      {/* OTHER MODULES — TEMPORARY */}
 

      {/* ADMINISTRATION */}
      {activeSection === "overview" && (
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
          >
            Administration
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Select an administration module above to
            manage the system.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard;