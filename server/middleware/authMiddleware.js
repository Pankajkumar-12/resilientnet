const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Access Denied. No Token Provided."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        if (req.user) {
            if (req.user.id && !req.user.user_id) {
                req.user.user_id = req.user.id;
            }
            if (req.user.user_id && !req.user.id) {
                req.user.id = req.user.user_id;
            }
        }

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid Token"
        });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (!req.user || (req.user.role || "").toUpperCase() !== "ADMIN") {
        return res.status(403).json({
            message: "Access Denied. Administrator privileges required."
        });
    }
    next();
};

authenticate.authenticate = authenticate;
authenticate.authorizeAdmin = authorizeAdmin;

module.exports = authenticate;
module.exports.authorizeAdmin = authorizeAdmin;