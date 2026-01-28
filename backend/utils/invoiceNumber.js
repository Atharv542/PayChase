const Document = require("../models/document");

/**
 * Generates next invoice number for a user.
 * Example: INV-0001, INV-0002 ...
 */
async function generateInvoiceNumber(ownerId) {
  // get last created invoice for this user
  const last = await Document.findOne({ ownerId, type: "INVOICE" })
    .sort({ createdAt: -1 })
    .select("documentNumber");

  if (!last?.documentNumber) return "INV-0001";

  // extract number from INV-0007 etc
  const match = String(last.documentNumber).match(/INV-(\d+)/i);
  const lastNum = match ? Number(match[1]) : 0;

  const nextNum = lastNum + 1;
  const padded = String(nextNum).padStart(4, "0");

  return `INV-${padded}`;
}

module.exports = { generateInvoiceNumber };
