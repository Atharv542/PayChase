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
} from "lucide-react";

/* ================= CURRENCY ================= */

const CURRENCY_OPTIONS = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 1 },
  { code: "USD", symbol: "$", name: "US Dollar", rate: 83 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 90 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 105 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", rate: 22.6 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 55 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 61 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", rate: 61 },
  { code: "NZD", symbol: "$", name: "New Zealand Dollar", rate: 50 },
];

const getCurrency = (code) =>
  CURRENCY_OPTIONS.find((c) => c.code === code) || CURRENCY_OPTIONS[0];

const convertAmount = (amount, from, to) =>
  (Number(amount || 0) * to.rate) / from.rate;

/* ================= HELPERS ================= */

const formatDate = (iso) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "—";

const statusPill = (status) =>
  status === "PAID"
    ? {
        label: "Paid",
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-600",
        icon: CheckCircle2,
      }
    : {
        label: "Pending",
        cls: "bg-amber-50 text-amber-800 border-amber-200",
        dot: "bg-amber-500",
        icon: Clock3,
      };

/* ================= DASHBOARD ================= */

export default function Dashboard() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    totalReceived: 0,
    totalPending: 0,
  });

  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [displayCurrency, setDisplayCurrency] = useState(
    CURRENCY_OPTIONS[0]
  );

  /* ---------- POPUP ---------- */
  const [popup, setPopup] = useState({ open: false });
  const showPopup = (p) => setPopup({ open: true, ...p });
  const closePopup = () => setPopup({ open: false });

  /* ---------- FETCH ---------- */
  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://paychase-backend.onrender.com/api/documents?status=${filter}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setDocuments(data.documents || []);
      setSummary(data.summary || summary);
    } catch {
      showPopup({ title: "Error", message: "Failed to load invoices" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [filter]);

  /* ---------- SEARCH ---------- */
  const filteredDocs = useMemo(() => {
    const q = search.toLowerCase();
    return documents.filter(
      (d) =>
        d.documentNumber?.toLowerCase().includes(q) ||
        d.client?.name?.toLowerCase().includes(q)
    );
  }, [documents, search]);

  /* ---------- ACTIONS ---------- */

  const downloadInvoice = (doc) => {
    window.open(
      `https://paychase-backend.onrender.com/api/documents/${doc._id}/pdf`,
      "_blank"
    );
  };

  const generateReminder = async (doc) => {
    try {
      const res = await fetch(
        `https://paychase-backend.onrender.com/api/ai/reminder/${doc._id}`,
        { method: "POST", credentials: "include" }
      );
      const data = await res.json();

      showPopup({
        title: "Reminder Message",
        message: data.message,
        primaryText: "Copy",
        onPrimary: async () => {
          await navigator.clipboard.writeText(data.message);
          closePopup();
        },
      });
    } catch {
      showPopup({ title: "Error", message: "Reminder failed" });
    }
  };

  const togglePaid = async (doc) => {
    const next = doc.status === "PAID" ? "PENDING" : "PAID";
    await fetch(
      `https://paychase-backend.onrender.com/api/documents/${doc._id}/status`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      }
    );
    fetchDocs();
  };

  /* ---------- CONVERTED SUMMARY ---------- */
  const convertedSummary = useMemo(() => {
    let received = 0;
    let pending = 0;

    documents.forEach((d) => {
      const from = getCurrency(d.currency?.code || "INR");
      const amt = convertAmount(d.grandTotal, from, displayCurrency);
      d.status === "PAID" ? (received += amt) : (pending += amt);
    });

    return { received, pending };
  }, [documents, displayCurrency]);

  return (
    <>
      <Popup {...popup} onClose={closePopup} />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 p-6">
        <div className="max-w-6xl mx-auto">

          {/* HEADER */}
          <div className="flex justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold">Invoice Dashboard</h1>
              <p className="text-gray-600">Track, convert & manage invoices</p>
            </div>
            <button
              onClick={() => navigate("/document")}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold"
            >
              <Plus className="inline mr-1" /> Create Invoice
            </button>
          </div>

          {/* CURRENCY SELECT */}
          <div className="mb-4 flex gap-3 items-center">
            <Filter className="h-4 w-4 text-emerald-600" />
            <select
              value={displayCurrency.code}
              onChange={(e) =>
                setDisplayCurrency(getCurrency(e.target.value))
              }
              className="border rounded-xl px-3 py-2"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* SUMMARY */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl">
              <div className="text-sm text-gray-500">Received</div>
              <div className="text-2xl font-bold text-emerald-700">
                {displayCurrency.symbol}
                {convertedSummary.received.toFixed(2)} {displayCurrency.code}
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl">
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-2xl font-bold text-amber-700">
                {displayCurrency.symbol}
                {convertedSummary.pending.toFixed(2)} {displayCurrency.code}
              </div>
            </div>
          </div>

          {/* LIST */}
          {loading ? (
            <div>Loading…</div>
          ) : (
            filteredDocs.map((doc) => {
              const s = statusPill(doc.status);
              const from = getCurrency(doc.currency?.code || "INR");
              const converted = convertAmount(
                doc.grandTotal,
                from,
                displayCurrency
              );

              return (
                <div
                  key={doc._id}
                  className="bg-white rounded-xl p-4 mb-3 flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold">{doc.documentNumber}</div>
                    <div className="text-sm text-gray-500">
                      {doc.client?.name}
                    </div>
                    <span className={`text-xs px-2 py-1 border rounded-full ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold">
                      {displayCurrency.symbol}
                      {converted.toFixed(2)} {displayCurrency.code}
                    </div>
                    <div className="flex gap-2 mt-2 justify-end">
                      <button onClick={() => downloadInvoice(doc)}>
                        <Download />
                      </button>
                      <button onClick={() => generateReminder(doc)}>
                        <Bell />
                      </button>
                      <button
                        onClick={() => togglePaid(doc)}
                        className="border px-2 rounded"
                      >
                        {doc.status === "PAID" ? "Paid" : "Mark Paid"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
