const express = require("express");
const BusinessProfile = require("../models/businessProfile");
const requireAuth = require("../middlewares/requireAuth");
const upload = require("../middlewares/upload");
const { uploadBufferToCloudinary } = require("../utils/uploadCloudinary");

const router = express.Router();

// GET profile
router.get("/", requireAuth, async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ ownerId: req.user.id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json({ profile });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT profile (multipart/form-data)
router.put("/", requireAuth, upload.single("logo"), async (req, res) => {
  try {
    const { companyName, phone, email, address, gstin, defaultTerms } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ error: "companyName is required" });
    }

    let logoUrl;
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: `paychase/${req.user.id}/logos`,
        public_id: `logo_${Date.now()}`,
        overwrite: true,
      });
      logoUrl = result.secure_url;
    }

    const updated = await BusinessProfile.findOneAndUpdate(
      { ownerId: req.user.id },
      {
        ownerId: req.user.id,
        companyName: companyName.trim(),
        phone: phone || "",
        email: email || "",
        address: address || "",
        gstin: gstin || "",
        defaultTerms: defaultTerms || "",
        ...(logoUrl ? { logoUrl } : {}),
      },
      { new: true, upsert: true }
    );

    return res.json({ profile: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET exists
router.get("/exists", requireAuth, async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ ownerId: req.user.id }).select("_id");
    return res.json({ exists: !!profile });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
