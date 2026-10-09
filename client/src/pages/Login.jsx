import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Chip
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const redirectPath = location.state?.from?.pathname || (user.role?.toUpperCase() === "ADMIN" ? "/admin" : "/");
      navigate(redirectPath, { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: "100%",
          borderRadius: 3,
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                backgroundColor: "#1976d2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                color: "#fff",
              }}
            >
              <LockOutlinedIcon fontSize="medium" />
            </Box>

            <Typography variant="h5" fontWeight="bold">
              ResilientNet
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Emergency Response & Admin Portal
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              size="medium"
              autoComplete="email"
              autoFocus
              required
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              size="medium"
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.2,
                fontWeight: "bold",
                backgroundColor: "#1976d2",
                "&:hover": { backgroundColor: "#1565c0" },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              DEMO ACCOUNTS
            </Typography>
          </Divider>

          <Stack spacing={1}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight="600">
                  Administrator
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  admin@gmail.com
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleQuickLogin("admin@gmail.com", "password123")}
              >
                Use Admin
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight="600">
                  Volunteer
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  john.doe@gmail.com
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleQuickLogin("john.doe@gmail.com", "john123")}
              >
                Use Volunteer
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
