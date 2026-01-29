const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { signAccessToken, signRefreshToken } = require("../utils/token");

const router = express.Router();
const isProd = process.env.RENDER === "true" || process.env.NODE_ENV === "production";


const cookieOptionsAccess = {
  httpOnly: true,          // ✅ fixed
  secure: true,
  sameSite:"none",
  maxAge: 15 * 60 * 1000,
};

const cookieOptionsRefresh = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await User.findOne({ $or: [{ email }] });
    if (existing) {
      return res.status(400).json({ error: "User already exists, please login" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({   // ✅ await fixed
      email,
      username,
      password: hashedPassword,
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie("accessToken", accessToken, cookieOptionsAccess);
    res.cookie("refreshToken", refreshToken, cookieOptionsRefresh);

    return res.status(201).json({
      message: "Registered and logged in successfully",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie("accessToken", accessToken, cookieOptionsAccess);
    res.cookie("refreshToken", refreshToken, cookieOptionsRefresh); // ✅ fixed

    return res.json({
      message: "Logged in successfully",
      user: { id: user._id, email: user.email, username: user.username },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// REFRESH
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(payload.id);
    if (!user || !user.refreshToken) {
      return res.status(401).json({ error: "Refresh token not valid" });
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!matches) return res.status(401).json({ error: "Refresh token not valid" });

    const newAccessToken = signAccessToken(user);
    res.cookie("accessToken", newAccessToken, cookieOptionsAccess);

    return res.json({ message: "Access token refreshed" });
  } catch (err) {
    return res.status(401).json({ error: "Refresh expired or invalid" });
  }
});

// LOGOUT
router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        await User.findByIdAndUpdate(payload.id, { refreshToken: null });
      } catch (_) {}
    }

   res.clearCookie("accessToken", {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});

res.clearCookie("refreshToken", {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});


    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ME
router.get("/me", async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) return res.status(401).json({ error: "No access token" });

    const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    return res.json({ user: payload });
  } catch {
    return res.status(401).json({ error: "Access token expired or invalid" });
  }
});

module.exports = router;
