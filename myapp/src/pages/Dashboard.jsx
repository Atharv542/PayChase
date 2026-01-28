import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "./PopUp";
import {
  Plus,
  Download,
  Bell,
  CheckCircle2,
  Clock3,
  Filter,
  Search,
  FileText,
  X,
} from "lucide-react";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

function moneyWith(symbol, n) {
  return `${symbol}${Number(n || 0).toFixed(2)}`;
}

function toneBadge(tone) {
  const t = (tone || "").toLowerCase();
  if (t === "polite")
    return {
      label: "Polite",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  if (t === "firm")
    return { label: "Firm", cls: "bg-rose-50 text-rose-700 border-rose-200" };
  return {
    label: "Professional",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  };
}

function statusPill(status) {
  if (status === "PAID") {
    return {
      label: "Paid",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-600",
      icon: CheckCircle2,
    };
  }
  return {
    label: "Pending",
    cls: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    icon: Clock3,
  };
}

const CURRENCY_OPTIONS = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
];

function getDocCurrency(doc) {
  const code = String(doc?.currency?.code || "INR").toUpperCase();
  const symbol =
    doc?.currency?.symbol ||
    (code === "INR" ? "₹" : code === "USD" ? "$" : "");
  return { code, symbol };
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [genLoadingId, setGenLoadingId] = useState(null);
  const [payLoadingId, setPayLoadingId] = useState(null);

  const [filter, setFilter] = useState("ALL"); // ALL | PENDING | PAID
  const [search, setSearch] = useState("");

  // ✅ Display currency (user-controlled)
  const [displayCurrency, setDisplayCurrency] = useState(() => {
    const saved = localStorage.getItem("dashboardCurrency");
    if (saved) {
      const found = CURRENCY_OPTIONS.find((c) => c.code === saved);
      return found || CURRENCY_OPTIONS[0];
    }
    return CURRENCY_OPTIONS[0]; // INR default
  });

  const [rates, setRates] = useState(null); // rates based on displayCurrency.code
  const [ratesLoading, setRatesLoading] = useState(false);

  // popup
  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    primaryText: "OK",
    secondaryText: "",
    onPrimary: null,
    onSecondary: null,
  });

  // reminder modal
  const [reminderModal, setReminderModal] = useState({
    open: false,
    tone: "professional",
    clientName: "",
    invoiceNo: "",
    dueDate: "",
    amount: "",
    message: "",
  });

  const showPopup = (opts) => setPopup({ open: true, ...opts });
  const closePopup = () => setPopup((p) => ({ ...p, open: false }));

  const openReminder = (data) => setReminderModal({ open: true, ...data });
  const closeReminder = () => setReminderModal((p) => ({ ...p, open: false }));

  const auth401 = () => {
    const wasLoggedIn = localStorage.getItem("wasLoggedIn") === "true";
    if (wasLoggedIn) {
      showPopup({
        title: "Session expired",
        message: "Your login session has expired. Please login again.",
        primaryText: "Go to Login",
        secondaryText: "Cancel",
        onPrimary: () => navigate("/login", { replace: true }),
        onSecondary: closePopup,
      });
    } else {
      navigate("/login", { replace: true });
    }
  };

  const fetchDocs = async () => {
    try {
      setLoadingList(true);
      const res = await fetch(
        `https://paychase-backend.onrender.com/api/documents?status=${encodeURIComponent(filter)}`,
        { credentials: "include" }
      );

      if (res.status === 401) return auth401();

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        showPopup({
          title: "Error",
          message: data?.error || data?.message || "Failed to load invoices",
          primaryText: "OK",
          onPrimary: closePopup,
        });
        return;
      }

      setDocuments(Array.isArray(data?.documents) ? data.documents : []);
    } catch (e) {
      console.log(e);
      showPopup({
        title: "Server Error",
        message: "Could not load invoices. Try again.",
        primaryText: "OK",
        onPrimary: closePopup,
      });
    } finally {
      setLoadingList(false);
    }
  };

  // ✅ fetch invoices on filter change
  useEffect(() => {
    fetchDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // ✅ fetch exchange rates when displayCurrency changes
  useEffect(() => {
    (async () => {
      try {
        setRatesLoading(true);
        setRates(null);

        localStorage.setItem("dashboardCurrency", displayCurrency.code);

        // free no-key exchange rates
        const res = await fetch(
          `https://open.er-api.com/v6/latest/${displayCurrency.code}`
        );
        const data = await res.json().catch(() => null);

        if (!res.ok || data?.result !== "success") {
          setRates(null);
          return;
        }

        // data.rates is map: { INR: 83..., EUR: 0.9 ... }
        setRates(data.rates || null);
      } catch (e) {
        console.log(e);
        setRates(null);
      } finally {
        setRatesLoading(false);
      }
    })();
  }, [displayCurrency.code]);

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return documents;

    return documents.filter((d) => {
      const num = String(d.documentNumber || "").toLowerCase();
      const name = String(d.client?.name || "").toLowerCase();
      const email = String(d.client?.email || "").toLowerCase();
      return num.includes(q) || name.includes(q) || email.includes(q);
    });
  }, [documents, search]);

  // ✅ Convert amount from doc currency -> display currency
  // We fetched rates for BASE = displayCurrency.code.
  // That API gives: 1 BASE = X OTHER
  // So to convert FROM docCurrency to BASE:
  // amount_in_base = amount / rates[docCurrency]
  const convertToDisplay = (amount, docCurrencyCode) => {
    const a = Number(amount || 0);
    const from = String(docCurrencyCode || "INR").toUpperCase();

    if (!rates) return a; // fallback: show raw number (still with display symbol)
    const rate = Number(rates[from]); // 1 BASE = rate * FROM
    if (!rate || !Number.isFinite(rate)) return a;
    return a / rate;
  };

  // ✅ Dashboard summary computed in display currency (converted)
  const summary = useMemo(() => {
    let totalInvoices = documents.length;
    let totalReceived = 0;
    let totalPending = 0;

    for (const d of documents) {
      const { code } = getDocCurrency(d);
      const amtInDisplay = convertToDisplay(d.grandTotal, code);

      if (d.status === "PAID") totalReceived += amtInDisplay;
      else totalPending += amtInDisplay;
    }

    return { totalInvoices, totalReceived, totalPending };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, rates, displayCurrency.code]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showPopup({
        title: "Copied ✅",
        message: "Reminder message copied to clipboard.",
        primaryText: "OK",
        onPrimary: closePopup,
      });
    } catch {
      showPopup({
        title: "Copy failed",
        message: "Could not copy. Please copy manually.",
        primaryText: "OK",
        onPrimary: closePopup,
      });
    }
  };

  const generateReminder = async (doc) => {
    try {
      setGenLoadingId(doc._id);

      const res = await fetch(`https://paychase-backend.onrender.com/api/ai/reminder/${doc._id}`, {
        method: "POST",
        credentials: "include",
      });

      if (res.status === 401) return auth401();

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        showPopup({
          title: "Failed",
          message: data?.error || "Could not generate reminder",
          primaryText: "OK",
          onPrimary: closePopup,
        });
        return;
      }

      const c = getDocCurrency(doc);

      openReminder({
        tone: data?.tone || "professional",
        clientName: doc?.client?.name || "Client",
        invoiceNo: doc?.documentNumber || "",
        dueDate: formatDate(doc?.dueDate),
        amount: moneyWith(c.symbol, doc?.grandTotal),
        message: (data?.message || "").trim(),
      });
    } catch (e) {
      console.log(e);
      showPopup({
        title: "Server Error",
        message: "AI generation failed. Try again.",
        primaryText: "OK",
        onPrimary: closePopup,
      });
    } finally {
      setGenLoadingId(null);
    }
  };

  const downloadInvoice = async (doc) => {
    try {
      window.open(`https://paychase-backend.onrender.com/api/documents/${doc._id}/pdf`, "_blank");
    } catch (e) {
      console.log(e);
      showPopup({
        title: "Download failed",
        message: "Could not start download.",
        primaryText: "OK",
        onPrimary: closePopup,
      });
    }
  };

  const togglePaid = async (doc) => {
    try {
      setPayLoadingId(doc._id);
      const nextStatus = doc.status === "PAID" ? "PENDING" : "PAID";

      const res = await fetch(`https://paychase-backend.onrender.com/api/documents/${doc._id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.status === 401) return auth401();

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        showPopup({
          title: "Failed",
          message: data?.error || "Could not update status",
          primaryText: "OK",
          onPrimary: closePopup,
        });
        return;
      }

      setDocuments((prev) => prev.map((d) => (d._id === doc._id ? data.document : d)));
    } catch (e) {
      console.log(e);
      showPopup({
        title: "Server Error",
        message: "Could not update invoice status. Try again.",
        primaryText: "OK",
        onPrimary: closePopup,
      });
    } finally {
      setPayLoadingId(null);
    }
  };

  const reminderBadge = toneBadge(reminderModal.tone);

  return (
    <>
      <Popup
        open={popup.open}
        title={popup.title}
        message={popup.message}
        primaryText={popup.primaryText}
        secondaryText={popup.secondaryText}
        onPrimary={popup.onPrimary || closePopup}
        onSecondary={popup.onSecondary || closePopup}
        onClose={closePopup}
      />

      {/* Reminder Modal */}
      {reminderModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeReminder} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-emerald-50 to-white flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-gray-900">Reminder Preview</div>
                <div className="text-sm text-gray-600">Copy & paste into WhatsApp/Email.</div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${reminderBadge.cls}`}>
                  Tone: {reminderBadge.label}
                </span>
                <button
                  onClick={closeReminder}
                  className="p-2 rounded-xl border bg-white hover:bg-gray-50 text-gray-700"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <div className="rounded-xl border bg-gray-50 px-4 py-3">
                  <div className="text-xs text-gray-500 font-semibold">Invoice</div>
                  <div className="text-sm font-bold text-gray-900">{reminderModal.invoiceNo || "—"}</div>
                </div>
                <div className="rounded-xl border bg-gray-50 px-4 py-3">
                  <div className="text-xs text-gray-500 font-semibold">Due Date</div>
                  <div className="text-sm font-bold text-gray-900">{reminderModal.dueDate || "—"}</div>
                </div>
                <div className="rounded-xl border bg-gray-50 px-4 py-3">
                  <div className="text-xs text-gray-500 font-semibold">Amount</div>
                  <div className="text-sm font-bold text-gray-900">{reminderModal.amount || "—"}</div>
                </div>
              </div>

              <div className="rounded-2xl border bg-gray-50 p-4">
                <div className="flex items-start">
                  <div className="max-w-[92%] sm:max-w-[75%] rounded-2xl bg-white border shadow-sm px-4 py-3">
                    <div className="text-xs text-gray-500 font-semibold mb-1">
                      To: {reminderModal.clientName}
                    </div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {reminderModal.message}
                    </div>
                    <div className="mt-2 text-[11px] text-gray-400 text-right">Preview</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-xs text-gray-500">Tip: You can edit the message after pasting.</div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => copyToClipboard(reminderModal.message)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                  >
                    Copy
                  </button>
                  <button
                    onClick={closeReminder}
                    className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 text-gray-700 font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page */}
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border shadow-sm text-sm text-gray-700">
                <FileText className="h-4 w-4 text-emerald-600" />
                Invoice Dashboard
              </div>
              <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-gray-900">
                Your <span className="text-emerald-600">PayChase</span> Invoices
              </h1>
              <p className="mt-1 text-gray-600">
                Track pending payments, mark paid, download PDFs, and send reminders.
              </p>
            </div>

            <button
              onClick={() => navigate("/document")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-sm"
            >
              <Plus className="h-5 w-5" />
              Create Invoice
            </button>
          </div>

          {/* ✅ Currency Switcher */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-700 font-semibold">
              Display currency (converts totals):
            </div>

            <div className="flex items-center gap-2">
              <select
                value={displayCurrency.code}
                onChange={(e) => {
                  const found = CURRENCY_OPTIONS.find((c) => c.code === e.target.value);
                  if (found) setDisplayCurrency(found);
                }}
                className="px-3 py-2 rounded-xl border bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>

              <div className="text-xs text-gray-500">
                {ratesLoading ? "Updating rates..." : rates ? "Live conversion on" : "Conversion unavailable"}
              </div>
            </div>
          </div>

          {/* Summary Cards (converted) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/80 backdrop-blur rounded-2xl border shadow-sm p-5">
              <div className="text-sm text-gray-600 font-semibold">Total Invoices</div>
              <div className="mt-1 text-3xl font-extrabold text-gray-900">{summary.totalInvoices}</div>
              <div className="mt-2 text-xs text-gray-500">All invoices you’ve created</div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-2xl border shadow-sm p-5">
              <div className="text-sm text-gray-600 font-semibold">Payment Received</div>
              <div className="mt-1 text-3xl font-extrabold text-emerald-700">
                {moneyWith(displayCurrency.symbol, summary.totalReceived)}
              </div>
              <div className="mt-2 text-xs text-gray-500">Converted to {displayCurrency.code}</div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-2xl border shadow-sm p-5">
              <div className="text-sm text-gray-600 font-semibold">Pending Amount</div>
              <div className="mt-1 text-3xl font-extrabold text-amber-700">
                {moneyWith(displayCurrency.symbol, summary.totalPending)}
              </div>
              <div className="mt-2 text-xs text-gray-500">Converted to {displayCurrency.code}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white/80 backdrop-blur rounded-2xl border shadow-sm p-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Filter className="h-4 w-4 text-emerald-600" />
                  Filter:
                </div>

                {["ALL", "PENDING", "PAID"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={[
                      "px-3 py-1.5 rounded-xl text-sm font-semibold border transition",
                      filter === f
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-700 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {f === "ALL" ? "All" : f === "PENDING" ? "Pending" : "Paid"}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full md:w-[360px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by invoice no / client / email..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {loadingList ? (
            <div className="text-gray-600">Loading invoices...</div>
          ) : filteredDocs.length === 0 ? (
            <div className="bg-white/80 backdrop-blur rounded-2xl border shadow-sm p-6 text-gray-700">
              No invoices found. Try changing filters or create your first invoice.
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur rounded-2xl border shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-0 px-4 py-3 bg-white text-xs font-bold text-gray-600 uppercase tracking-wide border-b">
                <div className="col-span-3">Invoice</div>
                <div className="col-span-3">Client</div>
                <div className="col-span-2">Due</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {filteredDocs.map((doc) => {
                const s = statusPill(doc.status);
                const StatusIcon = s.icon;

                const isPaid = doc.status === "PAID";
                const isPayLoading = payLoadingId === doc._id;
                const isGenLoading = genLoadingId === doc._id;

                const dc = getDocCurrency(doc);
                const original = moneyWith(dc.symbol, doc.grandTotal);

                const converted = moneyWith(
                  displayCurrency.symbol,
                  convertToDisplay(doc.grandTotal, dc.code)
                );

                return (
                  <div
                    key={doc._id}
                    className="grid grid-cols-12 gap-0 px-4 py-4 border-b last:border-b-0 items-center"
                  >
                    <div className="col-span-12 sm:col-span-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                        <div>
                          <div className="font-bold text-gray-900">{doc.documentNumber}</div>
                          <div className="mt-1 inline-flex items-center gap-2">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
                              <span className="inline-flex items-center gap-1">
                                <StatusIcon className="h-3.5 w-3.5" />
                                {s.label}
                              </span>
                            </span>
                            {doc.paidAt ? (
                              <span className="text-[11px] text-gray-500">
                                Paid on {formatDate(doc.paidAt)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 sm:col-span-3 mt-3 sm:mt-0">
                      <div className="text-gray-900 font-semibold">{doc.client?.name || "—"}</div>
                      <div className="text-xs text-gray-500">{doc.client?.email || ""}</div>
                    </div>

                    <div className="col-span-6 sm:col-span-2 mt-3 sm:mt-0 text-sm text-gray-700">
                      {formatDate(doc.dueDate)}
                    </div>

                    {/* ✅ Show both: original + converted */}
                    <div className="col-span-6 sm:col-span-2 mt-3 sm:mt-0 text-right sm:text-left">
                      <div className="font-extrabold text-gray-900">{original}</div>
                      <div className="text-[11px] text-gray-500">
                        {rates ? `≈ ${converted}` : dc.code}
                      </div>
                    </div>

                    <div className="col-span-12 sm:col-span-2 mt-4 sm:mt-0 flex justify-end gap-2">
                      <button
                        onClick={() => downloadInvoice(doc)}
                        className="group relative p-2.5 rounded-md border bg-white hover:bg-gray-50"
                        title="Download"
                      >
                        <Download className="h-5 w-5 text-gray-700" />
                      </button>

                      <button
                        onClick={() => generateReminder(doc)}
                        disabled={isGenLoading}
                        className="group relative p-2.5 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-60"
                        title="Generate reminder"
                      >
                        <Bell className="h-5 w-5 text-emerald-700" />
                      </button>

                      <button
                        onClick={() => togglePaid(doc)}
                        disabled={isPayLoading}
                        className={[
                          "group relative px-2 py-3 cursor-pointer rounded-md font-bold border transition",
                          isPaid
                            ? "text-gray-700 border-emerald-600 text-md"
                            : "bg-white text-gray-700 hover:bg-gray-50 text-sm",
                          isPayLoading ? "opacity-60" : "",
                        ].join(" ")}
                      >
                        {isPayLoading ? "..." : isPaid ? "✅ Paid" : "Mark Paid"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500">
            Note: Dashboard totals are converted to <b>{displayCurrency.code}</b> using live rates (when available).
          </div>
        </div>
      </div>
    </>
  );
}


