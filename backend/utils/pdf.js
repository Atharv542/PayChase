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

/**
 * Currency-aware money formatter
 */
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
  const sym = currency.symbol || "₹";

  const itemsRows = (doc.items || [])
    .map((it, idx) => {
      const base = (Number(it.qty) || 0) * (Number(it.rate) || 0);
      const discount = Number(it.discount || 0);
      const afterDiscount = Math.max(base - discount, 0);
      const tax =
        (afterDiscount * (Number(it.taxPercent || 0))) / 100;

      return `
        <tr>
          <td class="muted">${idx + 1}</td>
          <td>
            <div class="item-name">${escapeHtml(it.name)}</div>
            <div class="item-sub">
              Qty ${Number(it.qty || 0)} •
              Rate ${money(it.rate, currency)} •
              Tax ${Number(it.taxPercent || 0)}% •
              Disc ${money(it.discount || 0, currency)}
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

  const resolvedTerms =
    (doc.terms && String(doc.terms).trim()) ||
    (doc.seller?.defaultTerms &&
      String(doc.seller.defaultTerms).trim()) ||
    "—";

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { margin: 14mm 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Arial, sans-serif;
      color:#0f172a;
      background:#fff;
    }
    .page { padding: 0; }

    :root{
      --accent:#2563eb;
      --accentSoft:#eff6ff;
      --accentText:#1e40af;
    }

    ${/* ---- STYLES UNCHANGED ---- */""}

    .top {
      display:flex;
      justify-content:space-between;
      gap:18px;
      padding:16px 0 10px;
      border-bottom:3px solid var(--accentSoft);
    }

    .company {
      flex:1;
      display:flex;
      gap:14px;
      align-items:flex-start;
    }

    .logo {
      width:62px;
      height:62px;
      border-radius:14px;
      border:1px solid #e5e7eb;
      background:#fff;
      display:flex;
      align-items:center;
      justify-content:center;
      overflow:hidden;
    }
    .logo img { width:100%; height:100%; object-fit:cover; }

    .company .name {
      font-size:22px;
      font-weight:900;
    }
    .company .meta {
      margin-top:6px;
      font-size:12px;
      color:#64748b;
      line-height:1.45;
    }

    .doccard {
      width:310px;
      border-radius:16px;
      padding:14px 16px;
      background:#f8fafc;
      border:1px solid #e5e7eb;
    }

    .doc-title {
      font-size:18px;
      font-weight:1000;
      letter-spacing:1px;
    }

    .doc-grid {
      margin-top:10px;
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:8px 12px;
      font-size:12px;
    }

    .doc-grid .k { font-size:11px; color:#64748b; }
    .doc-grid .v { font-weight:800; }

    .row2 {
      margin-top:16px;
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:14px;
    }

    .card {
      background:#fff;
      border:1px solid #e5e7eb;
      border-radius:16px;
      padding:18px;
    }

    .card h3 {
      margin:0 0 10px;
      font-size:12px;
      text-transform:uppercase;
      font-weight:900;
      color:var(--accentText);
    }

    .muted { color:#64748b; font-size:12px; }

    .bigTotal {
      font-size:26px;
      font-weight:1000;
      color:var(--accentText);
    }

    .table-wrap {
      margin-top:16px;
      border-radius:16px;
      overflow:hidden;
      border:1px solid #dbeafe;
    }

    table { width:100%; border-collapse:collapse; }

    thead th {
      padding:14px;
      font-size:11px;
      background:var(--accentSoft);
      color:var(--accentText);
    }

    tbody td {
      padding:14px;
      font-size:12.5px;
      border-bottom:1px solid #eef2f7;
    }

    .right { text-align:right; }
    .strong { font-weight:900; }

    .bottom {
      margin-top:16px;
      display:grid;
      grid-template-columns:1fr 360px;
      gap:14px;
    }

    .totals {
      border:1px solid #dbeafe;
      border-radius:16px;
      padding:18px;
    }

    .totals .r {
      display:flex;
      justify-content:space-between;
      padding:8px 0;
    }

    .grand {
      margin-top:10px;
      background:var(--accent);
      color:#fff;
      border-radius:14px;
      padding:12px;
      font-weight:1000;
      display:flex;
      justify-content:space-between;
    }

    .footer {
      margin-top:14px;
      display:flex;
      justify-content:space-between;
      font-size:11px;
      color:#94a3b8;
    }

    .badge {
      padding:6px 10px;
      border-radius:999px;
      border:1px solid #e5e7eb;
      font-weight:800;
    }
  </style>
</head>

<body>
  <div class="page">

    <!-- HEADER -->
    <div class="top">
      <div class="company">
        <div class="logo">
          ${
            doc.seller.logoUrl
              ? `<img src="${escapeHtml(doc.seller.logoUrl)}" />`
              : `<div style="font-weight:900;font-size:22px">
                  ${escapeHtml(
                    (doc.seller.companyName || "B")
                      .slice(0, 1)
                      .toUpperCase()
                  )}
                </div>`
          }
        </div>

        <div>
          <div class="name">${escapeHtml(
            doc.seller.companyName || "Your Business"
          )}</div>
          <div class="meta">
            ${doc.seller.gstin ? `GSTIN: ${escapeHtml(doc.seller.gstin)}<br/>` : ""}
            ${escapeHtml(doc.seller.address || "")}<br/>
            ${escapeHtml(doc.seller.phone || "")}
            ${doc.seller.email ? ` • ${escapeHtml(doc.seller.email)}` : ""}
          </div>
        </div>
      </div>

      <div class="doccard">
        <div class="doc-title">${title}</div>
        <div class="doc-grid">
          <div><div class="k">Number</div><div class="v">${escapeHtml(doc.documentNumber)}</div></div>
          <div><div class="k">Issue Date</div><div class="v">${escapeHtml(doc.issueDate)}</div></div>
          <div><div class="k">Due Date</div><div class="v">${escapeHtml(doc.dueDate || "-")}</div></div>
          <div><div class="k">Currency</div><div class="v">${escapeHtml(currency.code)} (${escapeHtml(sym)})</div></div>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Item</th><th class="right">Qty</th>
            <th class="right">Rate</th><th class="right">Tax</th>
            <th class="right">Disc</th><th class="right">Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
    </div>

    <!-- TOTALS -->
    <div class="bottom">
      <div class="card">
        <h3>Notes</h3>
        <p>${escapeHtml(doc.notes || "—")}</p>
        <h3>Terms</h3>
        <p>${escapeHtml(resolvedTerms)}</p>
      </div>

      <div class="totals">
        <div class="r"><span>Subtotal</span><b>${money(doc.subtotal, currency)}</b></div>
        <div class="r"><span>Discount</span><b>- ${money(doc.discountTotal, currency)}</b></div>
        <div class="r"><span>Tax</span><b>${money(doc.taxTotal, currency)}</b></div>
        <div class="grand"><span>Grand Total</span><span>${money(doc.grandTotal, currency)}</span></div>
      </div>
    </div>

    <div class="footer">
      <div class="badge">Generated by PayChase</div>
      <div>${title} • ${escapeHtml(doc.documentNumber)}</div>
    </div>

  </div>
</body>
</html>
`;
}

/* -------------------- PDF GENERATOR (html-pdf-node) -------------------- */

async function generatePdfBuffer(html) {
  const file = { content: html };

  const options = {
    format: "A4",
    printBackground: true,
    margin: {
      top: "10mm",
      right: "12mm",
      bottom: "10mm",
      left: "12mm",
    },
  };

  const pdfBuffer = await htmlToPdf.generatePdf(file, options);
  return pdfBuffer;
}

module.exports = {
  buildInvoiceHTML,
  generatePdfBuffer,
};
