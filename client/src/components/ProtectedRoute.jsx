import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button, Alert } from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let user = null;
  try {
    user = JSON.parse(userStr);
  } catch (e) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && (user.role || "").toUpperCase() !== "ADMIN") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          p: 2,
        }}
      >
        <Card sx={{ maxWidth: 500, width: "100%", p: 2, borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <SecurityIcon color="error" sx={{ fontSize: 60, mb: 2 }} />

            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Access Denied
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Administrator privileges are required to access this section. Your current role is <strong>{user.role || "Standard User"}</strong>.
            </Typography>

            <Alert severity="warning" sx={{ mb: 3, textAlign: "left" }}>
              Only authorized ResilientNet administrators can access the Admin Dashboard, user management, and system logs.
            </Alert>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button variant="contained" onClick={() => navigate("/")}>
                Return to Emergency Dashboard
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  navigate("/login");
                }}
              >
                Logout
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
