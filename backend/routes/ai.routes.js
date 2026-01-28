const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const Document = require("../models/document");
const groq= require('../utils/groqClient')

const router = express.Router();

function computeTone(dueDateISO) {
  if (!dueDateISO) return { tone: "polite" };

  const due = new Date(dueDateISO);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diff = now - due;
  const daysOverdue = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (daysOverdue >= 0 && daysOverdue < 3) return { tone: "polite" };
  if (daysOverdue >= 3 && daysOverdue < 7) return { tone: "professional" };
  if (daysOverdue >= 7) return { tone: "firm" };
  return { tone: "professional" };
}

function buildPrompt({ clientName, invoiceNumber, amount, dueDate, tone,currency }) {
  const safeClientName = clientName || "Client";
  const safeInvoiceNumber = invoiceNumber || "N/A";
  const safeDueDate = dueDate || "N/A";
  const safeAmount = typeof amount === "number" ? amount.toFixed(2) : String(amount || "0.00");
  const safeCurrency = currency || "$";
  return `
You are PayChase. Generate a premium WhatsApp payment reminder message.

Tone: ${tone}
Language: English
Length: 900–1400 characters

Rules:
- Output MUST be valid JSON only (no markdown, no extra text).
- JSON must be in ONE LINE.
- Use \\n for line breaks inside the message string.
- Do NOT include any trailing commas.

Message requirements:
- Greeting based on tone
- Clear title line: "Payment Reminder — Invoice ${safeInvoiceNumber}"
- Invoice details in bullet points:
  • Invoice No: ${safeInvoiceNumber}
  • Due Date: ${safeDueDate}
  • Amount: ${safeCurrency}${safeAmount}
- Ask to confirm expected settlement date
- Offer to resend invoice PDF if needed
- Say thank you at the end 

Return exactly:
{"message":"..."}
Client: ${safeClientName}
Invoice: ${safeInvoiceNumber}
Due Date: ${safeDueDate}
Amount: ${safeCurrency}${safeAmount}
`.trim();
}





router.post("/reminder/:docId", requireAuth, async (req, res) => {
  try {
    const { docId } = req.params;

    const doc = await Document.findOne({
      _id: docId,
      ownerId: req.user.id,
    });

    if (!doc) {
      return res.status(400).json({ error: "Invoice not found" });
    }

    const { tone } = computeTone(doc.dueDate);

    const prompt = buildPrompt({
      clientName: doc.client?.name || "Client",
      invoiceNumber: doc.documentNumber,
      amount: doc.grandTotal,
      dueDate: doc.dueDate
        ? new Date(doc.dueDate).toISOString().slice(0, 10)
        : null,
      tone,
      currency: doc.currency, // ✅ THIS IS THE FIX
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.35,
      max_tokens: 250,
    });

    const text = completion.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      parsed = JSON.parse(text.slice(start, end + 1));
    }

    return res.json({
      message: parsed.message || "",
      tone,
    });
  } catch (err) {
    console.log("AI reminder error:", err);
    return res.status(500).json({ error: "AI generation failed" });
  }
});


module.exports= router;
