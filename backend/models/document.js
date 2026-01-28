const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 1 },
    taxPercent: { type: Number, max: 100, default: 0, min: 0 },
    rate: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ✅ invoice only
    type: { type: String, default: "INVOICE", immutable: true },

    documentNumber: { type: String, required: true, trim: true, index: true },

    // ✅ Currency stored with invoice (so PDF uses same currency later)
    currency: {
      code: { type: String, default: "INR", trim: true },
      symbol: { type: String, default: "₹", trim: true },
      name: { type: String, default: "Indian Rupee", trim: true },
    },

    issueDate: { type: Date, required: true },
    dueDate: { type: Date, default: null },

    client: {
      name: { type: String, required: true, trim: true },
      email: { type: String, default: "", trim: true },
      phone: { type: String, default: "", trim: true },
      address: { type: String, default: "", trim: true },
    },

    items: { type: [lineItemSchema], required: true },
    subtotal: { type: Number, required: true },
    taxTotal: { type: Number, required: true },
    discountTotal: { type: Number, required: true },
    grandTotal: { type: Number, required: true },

    notes: { type: String, default: "", trim: true },
    terms: { type: String, default: "", trim: true },

    status: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ✅ avoid duplicates per user
documentSchema.index({ ownerId: 1, documentNumber: 1 }, { unique: true });

module.exports = mongoose.model("Document", documentSchema);
