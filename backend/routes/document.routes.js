const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const Document = require("../models/document");
const BusinessProfile = require("../models/businessProfile");
const { buildInvoiceHTML, generatePdfBuffer } = require("../utils/pdf");
const { generateInvoiceNumber } = require("../utils/invoiceNumber");

const router = express.Router();

function calcTotals(items) {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  const computed = items.map((it) => {
    const qty = Number(it.qty);
    const rate = Number(it.rate);
    const discount = Number(it.discount || 0);
    const taxPercent = Number(it.taxPercent || 0);

    const base = qty * rate;
    const afterDiscount = Math.max(base - discount, 0);
    const tax = (afterDiscount * taxPercent) / 100;
    const lineTotal = afterDiscount + tax;

    subtotal += base;
    discountTotal += discount;
    taxTotal += tax;

    return {
      name: it.name?.trim(),
      qty,
      rate,
      discount,
      taxPercent,
      lineTotal,
    };
  });

  const grandTotal = Math.max(subtotal - discountTotal + taxTotal, 0);
  return { computed, subtotal, discountTotal, taxTotal, grandTotal };
}

function normalizeCurrency(input) {
  const code = String(input?.code || "INR").trim().toUpperCase();
  const symbol = String(input?.symbol || "₹").trim();
  const name = String(input?.name || "Indian Rupee").trim();

  return { code, symbol, name };
}

function validateCreateBody(body) {
  const { issueDate, dueDate, client, items, notes, terms, currency } = body;

  if (!issueDate) return { ok: false, error: "issueDate is required" };
  if (!client?.name || !client.name.trim())
    return { ok: false, error: "client name is required" };

  if (!Array.isArray(items) || items.length === 0)
    return { ok: false, error: "At least 1 item is required" };

  for (const it of items) {
    if (!it.name || !it.name.trim()) return { ok: false, error: "Item name required" };
    if (!it.qty || Number(it.qty) <= 0) return { ok: false, error: "Item qty invalid" };
    if (it.rate === undefined || Number(it.rate) < 0) return { ok: false, error: "Item rate invalid" };
  }

  return {
    ok: true,
    data: { issueDate, dueDate, client, items, notes, terms, currency },
  };
}

// ✅ Create invoice (JSON)
router.post("/", requireAuth, async (req, res) => {
  try {
    const v = validateCreateBody(req.body);
    if (!v.ok) return res.status(400).json({ error: v.error });

    const { issueDate, dueDate, client, items, notes, terms, currency } = v.data;
    const totals = calcTotals(items);

    const documentNumber = await generateInvoiceNumber(req.user.id);
    const currencyObj = normalizeCurrency(currency);

    const doc = await Document.create({
      ownerId: req.user.id,
      type: "INVOICE",
      documentNumber,
      currency: currencyObj,
      issueDate: new Date(issueDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      client: {
        name: client.name.trim(),
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
      },
      items: totals.computed,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      notes: notes || "",
      terms: terms || "",
      status: "PENDING",
      paidAt: null,
    });

    return res.status(201).json({ document: doc });
  } catch (err) {
    console.log("Create invoice error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ✅ Create + Generate PDF + Download (invoice-only)
router.post("/create-pdf", requireAuth, async (req, res) => {
  try {
    const v = validateCreateBody(req.body);
    if (!v.ok) return res.status(400).json({ error: v.error });

    const { issueDate, dueDate, client, items, notes, terms, currency } = v.data;
    const totals = calcTotals(items);

    const profile = await BusinessProfile.findOne({ ownerId: req.user.id });
    if (!profile) return res.status(400).json({ error: "Business profile not found" });

    const documentNumber = await generateInvoiceNumber(req.user.id);
    const currencyObj = normalizeCurrency(currency);

    const doc = await Document.create({
      ownerId: req.user.id,
      type: "INVOICE",
      documentNumber,
      currency: currencyObj,
      issueDate: new Date(issueDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      client: {
        name: client.name.trim(),
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
      },
      items: totals.computed,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      notes: notes || "",
      terms: terms || "",
      status: "PENDING",
      paidAt: null,
    });

    const effectiveTerms =
      (doc.terms && String(doc.terms).trim()) ||
      (profile.defaultTerms && String(profile.defaultTerms).trim()) ||
      "";

    const html = buildInvoiceHTML({
      type: "INVOICE",
      documentNumber: doc.documentNumber,
      issueDate: new Date(doc.issueDate).toISOString().slice(0, 10),
      dueDate: doc.dueDate ? new Date(doc.dueDate).toISOString().slice(0, 10) : null,

      // ✅ currency for PDF display
      currency: doc.currency,

      seller: {
        companyName: profile.companyName,
        logoUrl: profile.logoUrl,
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
        gstin: profile.gstin || "",
        defaultTerms: profile.defaultTerms || "",
      },

      client: doc.client,
      items: doc.items,
      subtotal: doc.subtotal,
      discountTotal: doc.discountTotal,
      taxTotal: doc.taxTotal,
      grandTotal: doc.grandTotal,
      notes: doc.notes,
      terms: effectiveTerms,
    });

    const pdfBuffer = await generatePdfBuffer(html);
    const filename = `INVOICE-${doc.documentNumber}.pdf`.replaceAll(" ", "_");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.log("Create+PDF error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ✅ LIST invoices + summary + filters
router.get("/", requireAuth, async (req, res) => {
  try {
    const status = String(req.query.status || "ALL").toUpperCase();
    const filter = { ownerId: req.user.id, type: "INVOICE" };

    if (status === "PAID") filter.status = "PAID";
    if (status === "PENDING") filter.status = "PENDING";

    const documents = await Document.find(filter).sort({ createdAt: -1 });

    const allInvoices = await Document.find({
      ownerId: req.user.id,
      type: "INVOICE",
    }).select("grandTotal status");

    const totalInvoices = allInvoices.length;

    const totalReceived = allInvoices
      .filter((d) => d.status === "PAID")
      .reduce((sum, d) => sum + (Number(d.grandTotal) || 0), 0);

    const totalPending = allInvoices
      .filter((d) => d.status !== "PAID")
      .reduce((sum, d) => sum + (Number(d.grandTotal) || 0), 0);

    return res.json({
      documents,
      summary: { totalInvoices, totalReceived, totalPending },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ✅ GET single invoice
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      ownerId: req.user.id,
      type: "INVOICE",
    });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ document: doc });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ✅ Update status
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["PAID", "PENDING"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updated = await Document.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id, type: "INVOICE" },
      { status, paidAt: status === "PAID" ? new Date() : null },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Invoice not found" });
    return res.json({ document: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ✅ DOWNLOAD PDF by id (uses saved currency)
router.get("/:id/pdf", requireAuth, async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      ownerId: req.user.id,
      type: "INVOICE",
    });
    if (!doc) return res.status(404).json({ message: "No invoice found" });

    const profile = await BusinessProfile.findOne({ ownerId: req.user.id });
    if (!profile) return res.status(400).json({ message: "Business profile not found" });

    const effectiveTerms =
      (doc.terms && String(doc.terms).trim()) ||
      (profile.defaultTerms && String(profile.defaultTerms).trim()) ||
      "";

    const html = buildInvoiceHTML({
      type: "INVOICE",
      documentNumber: doc.documentNumber,
      issueDate: new Date(doc.issueDate).toISOString().slice(0, 10),
      dueDate: doc.dueDate ? new Date(doc.dueDate).toISOString().slice(0, 10) : null,

      // ✅ currency from DB
      currency: doc.currency,

      seller: {
        companyName: profile.companyName,
        logoUrl: profile.logoUrl,
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
        gstin: profile.gstin || "",
        defaultTerms: profile.defaultTerms || "",
      },

      client: doc.client,
      items: doc.items,
      subtotal: doc.subtotal,
      discountTotal: doc.discountTotal,
      taxTotal: doc.taxTotal,
      grandTotal: doc.grandTotal,
      notes: doc.notes,
      terms: effectiveTerms,
    });

    const pdfBuffer = await generatePdfBuffer(html);

    const safeClient = (doc.client?.name || "Client").replaceAll(" ", "_");
    const filename = `INVOICE-${safeClient}-${doc.documentNumber}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(pdfBuffer);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
