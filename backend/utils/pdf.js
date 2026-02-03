const htmlToPdf = require("html-pdf-node");

/* -------------------- HELPERS -------------------- */

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(n, currency) {
  const num = Number(n || 0);
  const sym = currency?.symbol || "₹";
  return `${sym}${num.toFixed(2)}`;
}

/* -------------------- HTML BUILDER -------------------- */

function buildInvoiceHTML(doc) {
  const title = "INVOICE";

  const currency =
    doc.currency || { code: "INR", symbol: "₹", name: "Indian Rupee" };

  const itemCount = (doc.items || []).length;

  // Dynamic spacer based on item count
  const spacerHeight =
    itemCount <= 1 ? 220 : itemCount === 2 ? 160 : 80;

  const itemsRows = (doc.items || [])
    .map((it, idx) => {
      const base = (Number(it.qty) || 0) * (Number(it.rate) || 0);
      const discount = Number(it.discount || 0);
      const afterDiscount = Math.max(base - discount, 0);
      const tax = (afterDiscount * (Number(it.taxPercent || 0))) / 100;

      return `
        <tr>
          <td class="muted">${idx + 1}</td>
          <td>
            <div class="item-name">${escapeHtml(it.name)}</div>
            <div class="item-meta">
              <span>Qty: ${Number(it.qty || 0)}</span>
              <span>Rate: ${money(it.rate, currency)}</span>
              <span>Tax: ${Number(it.taxPercent || 0)}%</span>
              <span>Disc: ${money(it.discount || 0, currency)}</span>
            </div>
          </td>
          <td class="right">${Number(it.qty || 0)}</td>
          <td class="right">${money(it.rate, currency)}</td>
          <td class="right">${money(tax, currency)}</td>
          <td class="right">${money(it.discount, currency)}</td>
          <td class="right strong">${money(it.lineTotal, currency)}</td>
        </tr>
      `;
    })
    .join("");

  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
@page { margin: 14mm; }
* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: Inter, Arial, sans-serif;
  color: #0f172a;
  background: #fff;
}

:root {
  --accent: #2563eb;
  --accentSoft: #eff6ff;
  --accentText: #1e40af;
}

.page {
  min-height: 100vh;
}

/* -------- HEADER -------- */

.top {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 3px solid var(--accentSoft);
}

.company {
  display: flex;
  gap: 14px;
}

.logo {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 22px;
}

.company .name {
  font-size: 22px;
  font-weight: 900;
}

.company .meta {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
  line-height: 1.6;
}

/* -------- CLIENT -------- */

.client-box {
  margin-top: 14px;
  padding: 14px;
  border-radius: 14px;
  border: 1px dashed #dbeafe;
  background: #f8fafc;
}

.client-box h4 {
  margin: 0 0 6px;
  font-size: 11px;
  text-transform: uppercase;
  color: var(--accentText);
}

.client-box p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
}

/* -------- DOC CARD -------- */

.doccard {
  width: 320px;
  border-radius: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.doc-title {
  font-size: 18px;
  font-weight: 1000;
}

.doc-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 14px;
  font-size: 12px;
}

.k {
  font-size: 11px;
  color: #64748b;
}

.v {
  font-weight: 800;
}

/* -------- TABLE -------- */

.table-wrap {
  margin-top: 26px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #dbeafe;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  padding: 14px;
  font-size: 11px;
  background: var(--accentSoft);
  color: var(--accentText);
}

tbody td {
  padding: 16px 14px;
  font-size: 12.5px;
  vertical-align: top;
  border-bottom: 1px solid #eef2f7;
}

.right { text-align: right; }
.strong { font-weight: 900; }
.muted { color: #64748b; }

.item-name {
  font-weight: 700;
  margin-bottom: 6px;
}

.item-meta {
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 4px 18px;
  font-size: 11px;
  color: #64748b;
}

/* -------- SPACER -------- */

.spacer {
  height: ${spacerHeight}px;
}

/* -------- BOTTOM -------- */

.bottom {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 18px;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 18px;
}

.card h3 {
  margin: 0 0 10px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 900;
  color: var(--accentText);
}

.card p {
  font-size: 12.5px;
  line-height: 1.7;
}

.totals {
  border: 1px solid #dbeafe;
  border-radius: 16px;
  padding: 18px;
}

.totals .r {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 13px;
}

.grand {
  margin-top: 16px;
  background: var(--accent);
  color: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  font-weight: 1000;
  display: flex;
  justify-content: space-between;
}

/* -------- FOOTER -------- */

.footer {
  margin-top: 26px;
  padding-top: 10px;
  border-top: 1px dashed #e5e7eb;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #94a3b8;
}
</style>
</head>

<body>
<div class="page">

  <div class="top">
    <div>
      <div class="company">
        <div class="logo">
          ${
            doc.seller.logoUrl
              ? `<img src="${escapeHtml(doc.seller.logoUrl)}" style="width:100%;height:100%;object-fit:cover" />`
              : escapeHtml((doc.seller.companyName || "B")[0])
          }
        </div>
        <div>
          <div class="name">${escapeHtml(doc.seller.companyName)}</div>
          <div class="meta">${escapeHtml(doc.seller.address || "")}</div>
        </div>
      </div>

      <div class="client-box">
        <h4>Billed To</h4>
        <p>
          <b>${escapeHtml(doc.client?.name || "Client")}</b><br/>
          ${escapeHtml(doc.client?.address || "")}<br/>
          ${escapeHtml(doc.client?.email || "")}
        </p>
      </div>
    </div>

    <div class="doccard">
      <div class="doc-title">${title}</div>
      <div class="doc-grid">
        <div><div class="k">Number</div><div class="v">${doc.documentNumber}</div></div>
        <div><div class="k">Issue Date</div><div class="v">${doc.issueDate}</div></div>
        <div><div class="k">Due Date</div><div class="v">${doc.dueDate || "-"}</div></div>
        <div><div class="k">Currency</div><div class="v">${currency.code}</div></div>
      </div>
    </div>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item</th>
          <th class="right">Qty</th>
          <th class="right">Rate</th>
          <th class="right">Tax</th>
          <th class="right">Disc</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>
  </div>

  <div class="spacer"></div>

  <div class="bottom">
    <div class="card">
      <h3>Notes</h3>
      <p>${escapeHtml(doc.notes || "—")}</p>
    </div>

    <div class="totals">
      <div class="r"><span>Subtotal</span><b>${money(doc.subtotal, currency)}</b></div>
      <div class="r"><span>Discount</span><b>- ${money(doc.discountTotal, currency)}</b></div>
      <div class="r"><span>Tax</span><b>${money(doc.taxTotal, currency)}</b></div>
      <div class="grand"><span>Grand Total</span><span>${money(doc.grandTotal, currency)}</span></div>
    </div>
  </div>

  <div class="footer">
    <div>Generated by PayChase</div>
    <div>${title} • ${doc.documentNumber}</div>
  </div>

</div>
</body>
</html>
`;
}

/* -------------------- PDF GENERATOR -------------------- */

async function generatePdfBuffer(html) {
  return htmlToPdf.generatePdf(
    { content: html },
    {
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "12mm", bottom: "10mm", left: "12mm" },
    }
  );
}

module.exports = {
  buildInvoiceHTML,
  generatePdfBuffer,
};
