const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT and set it as an httpOnly cookie
 */
const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.cookie("token", token, {
        httpOnly: true,          // not accessible via JS — prevents XSS
        secure: process.env.NODE_ENV === "production", // HTTPS only in prod
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    return token;
};

module.exports = { generateTokenAndSetCookie };