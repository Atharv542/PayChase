const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const groq = require("../utils/groqClient");

const router = express.Router();

/**
 * Strong JSON parse (removes markdown fences + trailing commas).
 */
function safeJsonParse(text) {
  if (!text) return null;

  let cleaned = String(text)
    .trim()
    .replace(/```json/gi, "```")
    .replace(/```/g, "")
    .trim();

  // direct parse
  try {
    return JSON.parse(cleaned);
  } catch {}

  // extract first json object
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;

  let slice = cleaned.slice(start, end + 1).trim();

  // remove trailing commas
  slice = slice.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");

  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

function buildRewritePrompt({ businessName, clientName, items, currency }) {
  const itemLines = items
    .map((it, idx) => {
      const qty = Number(it.qty || 1);
      const rate = Number(it.rate || 0);
      const tax = Number(it.taxPercent || 0);
      const discount = Number(it.discount || 0);
      return `${idx + 1}. name="${String(it.name || "").trim()}", qty=${qty}, rate=${rate}, taxPercent=${tax}, discount=${discount}`;
    })
    .join("\n");

  return `
You are PayChase AI. Improve invoice line item names to be dispute-proof and professional.

Goal:
- Convert vague names into clear scope-based descriptions.
- Keep it SHORT but specific (max ~12 words each).
- Do NOT change numbers, qty, rate, taxPercent, discount.
- Only rewrite the "name" fields.

Context:
Seller: ${businessName || "Freelancer"}
Client: ${clientName || "Client"}
Currency: ${currency || "INR"}

Input items:
${itemLines}

Return ONLY valid JSON object (no markdown, no backticks, no extra text).
Schema:
{
  "items": [
    { "index": 0, "name": "..." },
    { "index": 1, "name": "..." }
  ]
}
`.trim();
}

router.post("/rewrite-items", requireAuth, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const businessName = String(req.body?.businessName || "").trim();
    const clientName = String(req.body?.clientName || "").trim();
    const currency = String(req.body?.currency || "INR").trim();

    if (!items.length) {
      return res.status(400).json({ error: "Items are required" });
    }

    // keep only safe fields
    const compactItems = items.map((it) => ({
      name: String(it?.name || "").trim(),
      qty: Number(it?.qty || 1),
      rate: Number(it?.rate || 0),
      taxPercent: Number(it?.taxPercent || 0),
      discount: Number(it?.discount || 0),
    }));

    const prompt = buildRewritePrompt({
      businessName,
      clientName,
      items: compactItems,
      currency,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You output ONLY valid JSON. No extra text." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 500,
      // If your groq-sdk supports it, keep it:
      response_format: { type: "json_object" },
    });

    const text = completion.choices?.[0]?.message?.content || "";
    const parsed = safeJsonParse(text);

    if (!parsed || !Array.isArray(parsed.items)) {
      return res.status(500).json({
        error: "AI returned invalid JSON",
        raw: text,
      });
    }

    // Build rewrite map
    const rewrites = new Map();
    for (const row of parsed.items) {
      const idx = Number(row?.index);
      const name = String(row?.name || "").trim();
      if (Number.isInteger(idx) && idx >= 0 && idx < items.length && name) {
        rewrites.set(idx, name);
      }
    }

    // Apply rewrites
    const updated = items.map((it, i) => ({
      ...it,
      name: rewrites.get(i) || it.name,
    }));

    return res.json({ items: updated });
  } catch (err) {
    console.log("AI rewrite-items error:", err);
    return res.status(500).json({ error: "AI rewrite failed" });
  }
});

module.exports = router;
