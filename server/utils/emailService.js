const nodemailer = require("nodemailer");

/**
 * Creates and returns a Nodemailer transporter.
 */
function getTransporter() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        return null;
    }

    // Default to Gmail service if host not specified
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_PORT === "465",
            auth: { user, pass }
        });
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass }
    });
}

/**
 * Sends a 6-digit OTP email.
 */
async function sendOTPEmail(toEmail, otpCode) {
    const transporter = getTransporter();

    const subject = `${otpCode} is your ResilientNet Verification Code`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #0f172a; margin: 0;">ResilientNet</h2>
                <p style="color: #64748b; margin: 4px 0 0; font-size: 14px;">Emergency & Disaster Coordination Network</p>
            </div>
            <div style="background-color: #f8fafc; border-radius: 6px; padding: 20px; text-align: center; margin-bottom: 20px;">
                <p style="margin: 0 0 10px; color: #334155; font-size: 15px;">Your one-time email verification code is:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1976d2; font-family: monospace;">
                    ${otpCode}
                </div>
                <p style="margin: 10px 0 0; color: #94a3b8; font-size: 13px;">Valid for 10 minutes. Do not share this code with anyone.</p>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
                If you did not request to register for ResilientNet, you can safely ignore this email.
            </p>
        </div>
    `;

    if (!transporter) {
        console.log(`\n======================================================`);
        console.log(`[EMAIL OTP (DEV MODE - SMTP NOT CONFIGURED YET)]`);
        console.log(`To: ${toEmail}`);
        console.log(`OTP Code: ${otpCode}`);
        console.log(`(Configure EMAIL_USER and EMAIL_PASS in .env for real email delivery)`);
        console.log(`======================================================\n`);
        return { sent: false, devMode: true };
    }

    try {
        await transporter.sendMail({
            from: `"ResilientNet Emergency" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject,
            html
        });
        return { sent: true, devMode: false };
    } catch (err) {
        console.error("Nodemailer error:", err.message);
        // Fallback to console so registration isn't blocked by temporary SMTP network error
        console.log(`[EMAIL OTP FALLBACK CODE]: ${otpCode} for ${toEmail}`);
        return { sent: false, error: err.message, devMode: true };
    }
}

module.exports = {
    sendOTPEmail
};
