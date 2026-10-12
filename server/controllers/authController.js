const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createActivityLog } = require("../utils/activityLogger");
const { sendOTPEmail } = require("../utils/emailService");

const validateRegistration = ({ full_name, email, password, phone, role, organization_id }) => {
    // 1. Full Name: letters, spaces, dots, hyphens only (no digits or symbols, at least 2 chars)
    const nameRegex = /^[a-zA-Z\s.']{2,50}$/;
    if (!full_name || !nameRegex.test(full_name.trim())) {
        return "Full name must be 2–50 characters and contain only alphabetic letters and spaces (no numbers or special characters).";
    }

    // 2. Email: Standard format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email.trim())) {
        return "Please enter a valid email address (e.g. name@domain.com).";
    }

    // 3. Password: Min 6 chars, at least 1 letter and 1 number
    if (!password || password.length < 6) {
        return "Password must be at least 6 characters long.";
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        return "Password must contain both letters and numbers.";
    }

    // 4. Phone: 10-digit mobile format
    if (phone && phone.trim()) {
        const cleanPhone = phone.trim().replace(/[\s\-()]/g, "");
        const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
        if (!phoneRegex.test(cleanPhone)) {
            return "Please enter a valid 10-digit mobile number starting with 6-9 (e.g., 9876543210).";
        }
    }

    // 5. Authority Department check
    const normalizedRole = (role || "").trim().toUpperCase();
    if (normalizedRole === "AUTHORITY" && !organization_id) {
        return "Please select your official Department / Organization.";
    }

    return null;
};

/**
 * Generate and dispatch a 6-digit OTP to the user's email.
 */
const sendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email || !email.trim()) {
            return res.status(400).json({ message: "Email address is required." });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ message: "Please enter a valid email address." });
        }

        // Check if email already registered
        const userExists = await pool.query(
            "SELECT id FROM users WHERE LOWER(email) = $1",
            [normalizedEmail]
        );
        if (userExists.rows.length > 0) {
            return res.status(400).json({
                message: "An account with this email is already registered. Please sign in instead."
            });
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP with 10-minute validity
        await pool.query("DELETE FROM email_verifications WHERE LOWER(email) = $1", [normalizedEmail]);
        await pool.query(
            `INSERT INTO email_verifications (email, otp_code, expires_at, verified)
             VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '10 minutes', FALSE)`,
            [normalizedEmail, otpCode]
        );

        // Send Email via Nodemailer
        const mailResult = await sendOTPEmail(normalizedEmail, otpCode);

        return res.json({
            success: true,
            message: `Verification code sent to ${normalizedEmail}`,
            email: normalizedEmail,
            devMode: mailResult.devMode,
            devOtp: mailResult.devMode ? otpCode : undefined
        });

    } catch (error) {
        console.error("sendOTP error:", error);
        return res.status(500).json({ message: "Failed to send verification code: " + error.message });
    }
};

/**
 * Verify submitted 6-digit OTP code for an email.
 */
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and verification code are required." });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const enteredOtp = otp.trim();

        const result = await pool.query(
            `SELECT * FROM email_verifications
             WHERE LOWER(email) = $1
             ORDER BY created_at DESC LIMIT 1`,
            [normalizedEmail]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "No verification code requested for this email." });
        }

        const record = result.rows[0];

        if (new Date() > new Date(record.expires_at)) {
            return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
        }

        if (record.otp_code !== enteredOtp) {
            return res.status(400).json({ message: "Invalid verification code. Please check and try again." });
        }

        // Mark verified
        await pool.query(
            "UPDATE email_verifications SET verified = TRUE WHERE id = $1",
            [record.id]
        );

        return res.json({
            success: true,
            verified: true,
            message: "Email address verified successfully!"
        });

    } catch (error) {
        console.error("verifyOTP error:", error);
        return res.status(500).json({ message: "Failed to verify code: " + error.message });
    }
};

/**
 * Register a new user (Volunteer or Authority).
 * - Volunteers are immediately ACTIVE and enrolled into the volunteers table.
 * - Authorities are placed in PENDING status requiring Admin approval.
 * - Requires email to be verified via OTP.
 */
const register = async (req, res) => {
    const {
        full_name,
        email,
        password,
        phone,
        role = "VOLUNTEER",
        organization_id,
        organization,
        skills,
        station_location,
        badge_id
    } = req.body;

    try {
        const selectedOrgId = organization_id || organization || null;

        // Perform strict validation
        const validationError = validateRegistration({
            full_name,
            email,
            password,
            phone,
            role,
            organization_id: selectedOrgId
        });

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Verify that this email was verified via OTP
        const verCheck = await pool.query(
            `SELECT id FROM email_verifications
             WHERE LOWER(email) = $1 AND verified = TRUE`,
            [normalizedEmail]
        );

        if (verCheck.rows.length === 0) {
            return res.status(400).json({
                message: "Email has not been verified yet. Please request and verify your OTP code."
            });
        }

        // Check if email already registered
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE LOWER(email) = $1",
            [normalizedEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "An account with this email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const normalizedRole = (role || "").trim().toUpperCase() === "AUTHORITY" ? "AUTHORITY" : "VOLUNTEER";

        // Determine initial status: Authorities require Admin approval; Volunteers are active immediately
        const initialStatus = normalizedRole === "AUTHORITY" ? "PENDING" : "ACTIVE";

        const userResult = await pool.query(
            `INSERT INTO users
            (full_name, email, password_hash, phone, role, status, organization_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, full_name, email, phone, role, status, organization_id, created_at`,
            [
                full_name.trim(),
                normalizedEmail,
                hashedPassword,
                phone ? phone.trim() : null,
                normalizedRole,
                initialStatus,
                selectedOrgId
            ]
        );

        const newUser = userResult.rows[0];

        // Clean up verification record
        await pool.query("DELETE FROM email_verifications WHERE LOWER(email) = $1", [normalizedEmail]);

        // If registering as Volunteer, initialize profile in volunteers table
        if (normalizedRole === "VOLUNTEER") {
            const volunteerSkills = Array.isArray(skills)
                ? skills.join(", ")
                : (skills || "General Emergency Aid");

            try {
                await pool.query(
                    `INSERT INTO volunteers (user_id, skills, availability)
                     VALUES ($1, $2, 'AVAILABLE')`,
                    [newUser.id, volunteerSkills]
                );
            } catch (volErr) {
                console.error("Warning initializing volunteer row:", volErr.message);
            }
        }

        // Audit log
        await createActivityLog({
            userId: newUser.id,
            action: "USER_REGISTERED",
            description: `${normalizedRole} registered: ${newUser.full_name} (Status: ${initialStatus})`,
            entityType: "USER",
            entityId: newUser.id
        });

        if (normalizedRole === "AUTHORITY") {
            return res.status(201).json({
                message: "Registration submitted successfully! Your Authority account is pending Administrator approval.",
                status: "PENDING",
                requiresApproval: true,
                user: {
                    id: newUser.id,
                    full_name: newUser.full_name,
                    email: newUser.email,
                    role: newUser.role,
                    status: newUser.status
                }
            });
        }

        return res.status(201).json({
            message: "Volunteer registration successful! You can now log in.",
            status: "ACTIVE",
            requiresApproval: false,
            user: {
                id: newUser.id,
                full_name: newUser.full_name,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            message: "Server error during registration: " + error.message
        });
    }
};

/**
 * Log in an existing user.
 * Blocks unapproved PENDING accounts and deactivated INACTIVE accounts.
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const result = await pool.query(
            `SELECT u.*, o.name as organization_name
             FROM users u
             LEFT JOIN organizations o ON u.organization_id = o.id
             WHERE LOWER(u.email) = $1`,
            [normalizedEmail]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Account not found with this email."
            });
        }

        const user = result.rows[0];

        // Check account approval / status
        const userStatus = (user.status || "ACTIVE").toUpperCase();

        if (userStatus === "PENDING" || userStatus === "PENDING_APPROVAL") {
            return res.status(403).json({
                message: "Your authority account is awaiting Administrator approval. Please contact the administrator.",
                status: "PENDING"
            });
        }

        if (userStatus === "INACTIVE" || userStatus === "REJECTED" || userStatus === "SUSPENDED") {
            return res.status(403).json({
                message: "Your account is currently deactivated or suspended. Please contact the administrator.",
                status: userStatus
            });
        }

        // Verify password
        let isMatch = false;
        if (
            user.password_hash &&
            (user.password_hash.startsWith("$2a$") ||
             user.password_hash.startsWith("$2b$") ||
             user.password_hash.startsWith("$2y$"))
        ) {
            isMatch = await bcrypt.compare(password, user.password_hash);
        } else if (user.password_hash === password) {
            isMatch = true;
            // Upgrade legacy plain-text password to bcrypt
            try {
                const upgradedHash = await bcrypt.hash(password, 10);
                await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
                    upgradedHash,
                    user.id
                ]);
            } catch (hashErr) {
                console.error("Failed to upgrade legacy password hash:", hashErr.message);
            }
        }

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password. Please check your credentials."
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                status: user.status,
                organization_id: user.organization_id
            },
            process.env.JWT_SECRET || "resilientnet_super_secret_jwt_key_2026",
            {
                expiresIn: "24h"
            }
        );

        // Activity log
        await createActivityLog({
            userId: user.id,
            action: "USER_LOGIN",
            description: `${user.role} logged in: ${user.full_name}`,
            entityType: "USER",
            entityId: user.id
        });

        return res.json({
            message: "Login Successful",
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                organization_id: user.organization_id,
                organization_name: user.organization_name
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Server Error: " + error.message
        });
    }
};

/**
 * Public endpoint to fetch available organizations/departments for registration.
 */
const getOrganizations = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, type, address, phone, status
             FROM organizations
             WHERE status = 'ACTIVE' OR status IS NULL
             ORDER BY name ASC`
        );
        return res.json(result.rows);
    } catch (error) {
        console.error("Fetch organizations error:", error);
        return res.status(500).json({
            message: "Failed to fetch organizations"
        });
    }
};

/**
 * Fetch profile of currently authenticated user.
 */
const getMe = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.user_id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const result = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.status, u.organization_id, o.name as organization_name
             FROM users u
             LEFT JOIN organizations o ON u.organization_id = o.id
             WHERE u.id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error("Fetch profile error:", error);
        return res.status(500).json({
            message: "Failed to fetch user profile"
        });
    }
};

module.exports = {
    sendOTP,
    verifyOTP,
    register,
    login,
    getOrganizations,
    getMe
};