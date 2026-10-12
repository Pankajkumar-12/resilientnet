import { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
  Chip,
  Paper
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import SecurityIcon from "@mui/icons-material/Security";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../services/api";

const PRESET_SKILLS = [
  "First Aid / Medical",
  "Search & Rescue",
  "Boat & Water Rescue",
  "Logistics & Driving",
  "Shelter & Food Relief",
  "Emergency Comms"
];

const Register = () => {
  const navigate = useNavigate();

  // Tab: 0 = Volunteer, 1 = Authority
  const [roleTab, setRoleTab] = useState(0);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification state
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpFeedback, setOtpFeedback] = useState("");
  const [otpError, setOtpError] = useState("");

  // Volunteer specific fields
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState("");

  // Authority specific fields
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [stationLocation, setStationLocation] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  // Validation errors map
  const [fieldErrors, setFieldErrors] = useState({});

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Fetch organizations on mount
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        setLoadingOrgs(true);
        const res = await api.get("/auth/organizations");
        setOrganizations(res.data || []);
      } catch (err) {
        console.error("Failed to load organizations:", err);
      } finally {
        setLoadingOrgs(false);
      }
    };
    fetchOrgs();
  }, []);

  const handleToggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  // Field validation rules
  const validateField = (fieldName, value, currentPassword = password) => {
    switch (fieldName) {
      case "fullName": {
        const nameRegex = /^[a-zA-Z\s.']{2,50}$/;
        if (!value || !value.trim()) {
          return "Full name is required.";
        }
        if (!nameRegex.test(value.trim())) {
          return "Name can only contain alphabetic letters and spaces (2-50 chars, no numbers).";
        }
        return "";
      }

      case "email": {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!value || !value.trim()) {
          return "Email address is required.";
        }
        if (!emailRegex.test(value.trim())) {
          return "Please enter a valid email format (e.g., name@domain.com).";
        }
        return "";
      }

      case "phone": {
        if (!value || !value.trim()) {
          return roleTab === 1 ? "Official contact number is required for authorities." : "";
        }
        const clean = value.trim().replace(/[\s\-()]/g, "");
        const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
        if (!phoneRegex.test(clean)) {
          return "Enter a valid 10-digit mobile number starting with 6-9 (e.g. 9876543210).";
        }
        return "";
      }

      case "password": {
        if (!value) {
          return "Password is required.";
        }
        if (value.length < 6) {
          return "Password must be at least 6 characters long.";
        }
        if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
          return "Password must contain both letters and numbers.";
        }
        return "";
      }

      case "confirmPassword": {
        if (!value) {
          return "Please confirm your password.";
        }
        if (value !== currentPassword) {
          return "Passwords do not match.";
        }
        return "";
      }

      case "selectedOrgId": {
        if (roleTab === 1 && !value) {
          return "Please select your official Department / Organization.";
        }
        return "";
      }

      case "badgeId": {
        if (roleTab === 1 && value && value.trim()) {
          const badgeRegex = /^[a-zA-Z0-9\-\/]{3,25}$/;
          if (!badgeRegex.test(value.trim())) {
            return "Badge ID must be 3-25 alphanumeric characters (e.g. NDRF-402, POL-119).";
          }
        }
        return "";
      }

      default:
        return "";
    }
  };

  const handleFieldChange = (fieldName, value, setter) => {
    setter(value);
    if (fieldName === "email") {
      setIsEmailVerified(false);
      setOtpSent(false);
      setOtpInput("");
      setOtpFeedback("");
      setOtpError("");
    }
    const err = validateField(fieldName, value);
    setFieldErrors((prev) => ({ ...prev, [fieldName]: err }));
  };

  // Dispatch OTP to Email
  const handleSendOtp = async () => {
    const emailErr = validateField("email", email);
    if (emailErr) {
      setFieldErrors((prev) => ({ ...prev, email: emailErr }));
      return;
    }

    try {
      setSendingOtp(true);
      setOtpError("");
      setOtpFeedback("");

      const res = await api.post("/auth/send-otp", { email: email.trim().toLowerCase() });

      setOtpSent(true);
      setOtpCountdown(60); // 60s resend delay
      setOtpFeedback(res.data.message || "Verification code sent to your email.");

      // In dev mode when SMTP credentials aren't set yet, auto-fill or display devOtp
      if (res.data.devOtp) {
        setOtpFeedback(`Verification code dispatched! (Dev Code: ${res.data.devOtp})`);
      }

    } catch (err) {
      console.error("send-otp error:", err);
      setOtpError(err.response?.data?.message || "Failed to send verification code. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify entered 6-digit OTP
  const handleVerifyOtp = async () => {
    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setOtpError("Please enter the complete 6-digit code.");
      return;
    }

    try {
      setVerifyingOtp(true);
      setOtpError("");

      await api.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: otpInput.trim()
      });

      setIsEmailVerified(true);
      setOtpFeedback("Email verified successfully! ✓");
      setFieldErrors((prev) => ({ ...prev, email: "" }));

    } catch (err) {
      console.error("verify-otp error:", err);
      setOtpError(err.response?.data?.message || "Invalid or expired code. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessInfo(null);

    const isAuthority = roleTab === 1;

    // Validate all fields
    const errors = {
      fullName: validateField("fullName", fullName),
      email: validateField("email", email),
      phone: validateField("phone", phone),
      password: validateField("password", password),
      confirmPassword: validateField("confirmPassword", confirmPassword, password),
      selectedOrgId: isAuthority ? validateField("selectedOrgId", selectedOrgId) : "",
      badgeId: isAuthority ? validateField("badgeId", badgeId) : ""
    };

    setFieldErrors(errors);

    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) {
      setError("Please fix the errors marked in red before submitting.");
      return;
    }

    if (!isEmailVerified) {
      setError("Please verify your email address with the 6-digit OTP code before proceeding.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || null,
        role: isAuthority ? "AUTHORITY" : "VOLUNTEER",
        organization_id: isAuthority ? selectedOrgId : null,
        station_location: isAuthority ? stationLocation.trim() : null,
        badge_id: isAuthority ? badgeId.trim() : null,
        skills: !isAuthority
          ? selectedSkills.length > 0
            ? selectedSkills.join(", ")
            : "General Emergency Aid"
          : null
      };

      const res = await api.post("/auth/register", payload);

      setSuccessInfo({
        role: payload.role,
        requiresApproval: res.data.requiresApproval,
        message: res.data.message
      });

      // Auto redirect volunteers after 2.5 seconds
      if (!res.data.requiresApproval) {
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      }

    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message ||
        "Registration failed. Please check your information and try again."
      );
    } finally {
      setLoading(false);
    }
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
          maxWidth: 640,
          width: "100%",
          my: "auto",
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          backgroundColor: "#ffffff",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: roleTab === 0 ? "#16a34a" : "#0284c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                color: "#fff",
                transition: "background-color 0.3s ease",
              }}
            >
              {roleTab === 0 ? (
                <VolunteerActivismIcon sx={{ fontSize: 32 }} />
              ) : (
                <LocalPoliceIcon sx={{ fontSize: 32 }} />
              )}
            </Box>

            <Typography variant="h5" fontWeight="bold" color="#0f172a">
              ResilientNet Registration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Join the decentralized disaster response & emergency coordination network
            </Typography>
          </Box>

          {/* Role Tabs */}
          <Tabs
            value={roleTab}
            onChange={(e, val) => {
              setRoleTab(val);
              setError("");
              setFieldErrors({});
              setSuccessInfo(null);
            }}
            variant="fullWidth"
            sx={{
              mb: 3,
              backgroundColor: "#f1f5f9",
              borderRadius: 2,
              p: 0.5,
              minHeight: 48,
              "& .MuiTabs-indicator": {
                height: "100%",
                borderRadius: 2,
                backgroundColor: roleTab === 0 ? "#16a34a" : "#0284c7",
                opacity: 0.15,
              },
            }}
          >
            <Tab
              icon={<VolunteerActivismIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
              iconPosition="start"
              label="Field Volunteer"
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                minHeight: 44,
                py: 1,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                color: roleTab === 0 ? "#16a34a" : "text.secondary",
              }}
            />
            <Tab
              icon={<SecurityIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
              iconPosition="start"
              label="Authority / Official"
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                minHeight: 44,
                py: 1,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                color: roleTab === 1 ? "#0284c7" : "text.secondary",
              }}
            />
          </Tabs>

          {/* Role Description Banner */}
          <Alert
            severity={roleTab === 0 ? "success" : "info"}
            icon={roleTab === 0 ? <VolunteerActivismIcon /> : <SecurityIcon />}
            sx={{ mb: 3 }}
          >
            {roleTab === 0 ? (
              <span>
                <strong>Volunteer Account:</strong> Instant active access. You can view nearby SOS reports, accept rescue assignments, and communicate with responders.
              </span>
            ) : (
              <span>
                <strong>Official Authority:</strong> For Police, Fire, NDRF, and Medical commanders. <em>Requires Admin verification before account activation.</em>
              </span>
            )}
          </Alert>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {successInfo && (
            <Alert
              severity={successInfo.requiresApproval ? "warning" : "success"}
              sx={{ mb: 3 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => navigate("/login")}
                >
                  Go to Login
                </Button>
              }
            >
              <Typography variant="subtitle2" fontWeight="bold">
                {successInfo.requiresApproval
                  ? "Registration Submitted (Pending Approval)"
                  : "Registration Complete!"}
              </Typography>
              <Typography variant="body2">
                {successInfo.message}
              </Typography>
              {!successInfo.requiresApproval && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  Redirecting to login in a few seconds...
                </Typography>
              )}
            </Alert>
          )}

          {!successInfo && (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.2}>
                {/* Full Name */}
                <TextField
                  label="Full Name"
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={(e) => handleFieldChange("fullName", e.target.value, setFullName)}
                  error={Boolean(fieldErrors.fullName)}
                  helperText={fieldErrors.fullName || "2–50 characters, letters only (no numbers)"}
                  fullWidth
                  required
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />

                {/* Email with OTP Action */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 1.5,
                      alignItems: { xs: "stretch", sm: "flex-start" },
                    }}
                  >
                    <TextField
                      label={roleTab === 1 ? "Official Government / Agency Email" : "Email Address"}
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      disabled={isEmailVerified}
                      onChange={(e) => handleFieldChange("email", e.target.value, setEmail)}
                      error={Boolean(fieldErrors.email)}
                      helperText={fieldErrors.email || (isEmailVerified ? "Email verified" : "Enter a real email to receive a 6-digit OTP code")}
                      fullWidth
                      required
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                      InputProps={{
                        endAdornment: isEmailVerified ? (
                          <InputAdornment position="end">
                            <Chip
                              icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                              label="Verified"
                              color="success"
                              size="small"
                              sx={{ fontWeight: "bold" }}
                            />
                          </InputAdornment>
                        ) : null
                      }}
                    />

                    {!isEmailVerified && (
                      <Button
                        variant="outlined"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || otpCountdown > 0 || !email.trim() || Boolean(fieldErrors.email)}
                        sx={{
                          minWidth: { xs: "100%", sm: "140px" },
                          height: "40px",
                          textTransform: "none",
                          fontWeight: "bold",
                          flexShrink: 0,
                        }}
                        startIcon={sendingOtp ? <CircularProgress size={16} /> : <SendIcon sx={{ fontSize: 16 }} />}
                      >
                        {sendingOtp
                          ? "Sending..."
                          : otpCountdown > 0
                          ? `Resend (${otpCountdown}s)`
                          : otpSent
                          ? "Resend OTP"
                          : "Verify Email"}
                      </Button>
                    )}
                  </Box>

                  {/* Inline OTP Verification Box */}
                  {otpSent && !isEmailVerified && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mt: 1.5,
                        borderRadius: 2,
                        backgroundColor: "#f8fafc",
                        border: "1px solid #cbd5e1"
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold" sx={{ color: "#1e293b", mb: 0.5 }}>
                        Enter 6-Digit Email Code
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                        We sent a verification code to <strong>{email}</strong>. Valid for 10 minutes.
                      </Typography>

                      {otpError && (
                        <Alert severity="error" sx={{ py: 0.5, mb: 1.5, fontSize: "0.85rem" }}>
                          {otpError}
                        </Alert>
                      )}

                      {otpFeedback && !otpError && (
                        <Alert severity="info" sx={{ py: 0.5, mb: 1.5, fontSize: "0.85rem" }}>
                          {otpFeedback}
                        </Alert>
                      )}

                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <TextField
                          placeholder="000000"
                          value={otpInput}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                            setOtpInput(val);
                            setOtpError("");
                          }}
                          size="small"
                          sx={{
                            maxWidth: 160,
                            "& input": {
                              letterSpacing: 4,
                              fontWeight: "bold",
                              fontSize: "1.1rem",
                              textAlign: "center"
                            }
                          }}
                        />

                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={handleVerifyOtp}
                          disabled={verifyingOtp || otpInput.length !== 6}
                          sx={{ textTransform: "none", fontWeight: "bold", height: "40px" }}
                          startIcon={verifyingOtp ? <CircularProgress size={16} color="inherit" /> : <MarkEmailReadIcon />}
                        >
                          {verifyingOtp ? "Verifying..." : "Verify Code"}
                        </Button>
                      </Stack>
                    </Paper>
                  )}
                </Box>

                {/* Phone */}
                <TextField
                  label={roleTab === 1 ? "Official Phone / Mobile Number" : "Mobile Phone Number"}
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value, setPhone)}
                  error={Boolean(fieldErrors.phone)}
                  helperText={fieldErrors.phone || "Valid 10-digit mobile number (e.g. 9876543210)"}
                  fullWidth
                  required={roleTab === 1}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />

                {/* Authority-Specific: Organization / Department */}
                {roleTab === 1 && (
                  <>
                    <TextField
                      select
                      label="Department / Agency"
                      value={selectedOrgId}
                      onChange={(e) => handleFieldChange("selectedOrgId", e.target.value, setSelectedOrgId)}
                      error={Boolean(fieldErrors.selectedOrgId)}
                      helperText={fieldErrors.selectedOrgId || "Select your official disaster agency"}
                      fullWidth
                      required
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    >
                      {loadingOrgs ? (
                        <MenuItem disabled>Loading organizations...</MenuItem>
                      ) : (
                        organizations.map((org) => (
                          <MenuItem key={org.id} value={org.id}>
                            {org.name} ({org.type || "AGENCY"})
                          </MenuItem>
                        ))
                      )}
                    </TextField>

                    <TextField
                      label="Station / Division / Jurisdiction"
                      placeholder="e.g. North Zone Command / Station 4"
                      value={stationLocation}
                      onChange={(e) => setStationLocation(e.target.value)}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      helperText="Optional: Your base station or operating area"
                    />

                    <TextField
                      label="Officer ID / Badge Number"
                      placeholder="e.g. NDRF-402 / POL-119"
                      value={badgeId}
                      onChange={(e) => handleFieldChange("badgeId", e.target.value, setBadgeId)}
                      error={Boolean(fieldErrors.badgeId)}
                      helperText={fieldErrors.badgeId || "Optional: Official ID or badge code"}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </>
                )}

                {/* Volunteer-Specific: Rescue Skills */}
                {roleTab === 0 && (
                  <Box>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1, color: "#334155" }}>
                      Emergency Response Skills (Select all that apply):
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                      {PRESET_SKILLS.map((skill) => {
                        const isSelected = selectedSkills.includes(skill);
                        return (
                          <Chip
                            key={skill}
                            label={skill}
                            clickable
                            color={isSelected ? "success" : "default"}
                            variant={isSelected ? "filled" : "outlined"}
                            onClick={() => handleToggleSkill(skill)}
                            size="small"
                          />
                        );
                      })}
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <TextField
                        placeholder="Other skill (e.g. Drone Pilot, Amateur Ham Radio)"
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        size="small"
                        fullWidth
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomSkill();
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleAddCustomSkill}
                        disabled={!customSkill.trim()}
                        sx={{ flexShrink: 0, minWidth: 64 }}
                      >
                        Add
                      </Button>
                    </Stack>
                  </Box>
                )}

                {/* Passwords */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", sm: "flex-start" }}
                >
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handleFieldChange("password", e.target.value, setPassword)}
                    error={Boolean(fieldErrors.password)}
                    helperText={fieldErrors.password || "Min 6 chars with letters & numbers"}
                    fullWidth
                    required
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => handleFieldChange("confirmPassword", e.target.value, setConfirmPassword)}
                    error={Boolean(fieldErrors.confirmPassword)}
                    helperText={fieldErrors.confirmPassword || "Must match password"}
                    fullWidth
                    required
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                </Stack>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || !isEmailVerified}
                  sx={{
                    py: 1.2,
                    fontWeight: "bold",
                    backgroundColor: roleTab === 0 ? "#16a34a" : "#0284c7",
                    "&:hover": {
                      backgroundColor: roleTab === 0 ? "#15803d" : "#0369a1",
                    },
                    "&:disabled": {
                      backgroundColor: "#94a3b8",
                      color: "#f8fafc"
                    }
                  }}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <HowToRegIcon />}
                >
                  {loading
                    ? "Submitting..."
                    : !isEmailVerified
                    ? "Verify Email via OTP to Continue"
                    : roleTab === 0
                    ? "Complete Volunteer Registration"
                    : "Submit Authority for Approval"}
                </Button>
              </Stack>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Footer Navigation */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <RouterLink
                to="/login"
                style={{
                  color: "#1976d2",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                Sign In here
              </RouterLink>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
