const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { signAccessToken, signRefreshToken } = require("../utils/token");

const router = express.Router();

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists, please login" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    const accessToken = signAccessToken(user); // 🔴 CHANGED
    const refreshToken = signRefreshToken(user); // optional (future use)

    return res.status(201).json({
      message: "Registered successfully",
      accessToken, // 🔴 CHANGED
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* =========================
   LOGIN
========================= */
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

    const accessToken = signAccessToken(user); // 🔴 CHANGED

    return res.json({
      message: "Logged in successfully",
      accessToken, // 🔴 CHANGED
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* =========================
   ME (HEADER-BASED AUTH)
========================= */
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token" });
    }

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return res.json({ user: payload });
  } catch {
    return res.status(401).json({ error: "Token expired or invalid" });
  }
});


module.exports = router;
