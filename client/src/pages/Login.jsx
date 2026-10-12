import { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
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
  InputAdornment,
  IconButton,
  Chip
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SecurityIcon from "@mui/icons-material/Security";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setIsPending(false);

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Role-based routing: Admins go to /admin, others to / (Dashboard)
      const redirectPath =
        location.state?.from?.pathname ||
        (user.role?.toUpperCase() === "ADMIN" ? "/admin" : "/");

      navigate(redirectPath, { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      const resData = err.response?.data;
      if (resData?.status === "PENDING" || resData?.message?.includes("awaiting") || resData?.message?.includes("pending")) {
        setIsPending(true);
        setError(resData.message || "Your Authority account is pending Administrator approval.");
      } else {
        setError(resData?.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError("");
    setIsPending(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f172a",
        py: { xs: 4, sm: 6 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: "100%",
          my: "auto",
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          backgroundColor: "#ffffff",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "#1976d2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                color: "#fff",
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 30 }} />
            </Box>

            <Typography variant="h5" fontWeight="bold" color="#0f172a">
              ResilientNet
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Decentralized Emergency Response Portal
            </Typography>
          </Box>

          {isPending ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Account Pending Approval
              </Typography>
              <Typography variant="body2">{error}</Typography>
              <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                An Administrator must review and activate your official account before you can log in.
              </Typography>
            </Alert>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : null}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              size="medium"
              autoComplete="email"
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              fullWidth
              label="Password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              size="medium"
              autoComplete="current-password"
              InputLabelProps={{ shrink: true }}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
                py: 1.3,
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

          <Box sx={{ textAlign: "center", mt: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <RouterLink
                to="/register"
                style={{
                  color: "#1976d2",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                Register as Volunteer or Authority
              </RouterLink>
            </Typography>
          </Box>

          <Divider sx={{ my: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              QUICK TEST CREDENTIALS
            </Typography>
          </Divider>

          <Stack spacing={1.5}>
            {/* Admin */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                p: 1.2,
                borderRadius: 1.5,
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0, flex: "1 1 180px" }}>
                <SecurityIcon sx={{ color: "#7c3aed", fontSize: 22, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight="600" noWrap>
                    Administrator
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                    admin@gmail.com
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                variant="outlined"
                sx={{ textTransform: "none", borderColor: "#7c3aed", color: "#7c3aed", flexShrink: 0 }}
                onClick={() => handleQuickLogin("admin@gmail.com", "password123")}
              >
                Use Admin
              </Button>
            </Box>

            {/* Authority */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                p: 1.2,
                borderRadius: 1.5,
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0, flex: "1 1 180px" }}>
                <LocalPoliceIcon sx={{ color: "#0284c7", fontSize: 22, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight="600" noWrap>
                    Authority / Official
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                    authority@gmail.com
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                variant="outlined"
                sx={{ textTransform: "none", borderColor: "#0284c7", color: "#0284c7", flexShrink: 0 }}
                onClick={() => handleQuickLogin("authority@gmail.com", "authority123")}
              >
                Use Authority
              </Button>
            </Box>

            {/* Volunteer */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                p: 1.2,
                borderRadius: 1.5,
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0, flex: "1 1 180px" }}>
                <VolunteerActivismIcon sx={{ color: "#16a34a", fontSize: 22, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight="600" noWrap>
                    Field Volunteer
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                    john.doe@gmail.com
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                variant="outlined"
                sx={{ textTransform: "none", borderColor: "#16a34a", color: "#16a34a", flexShrink: 0 }}
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
