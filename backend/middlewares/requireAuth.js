const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = payload; // { id, username, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Access token invalid/expired" });
  }
};
