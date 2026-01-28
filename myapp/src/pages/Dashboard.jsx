// 🔹 SAME IMPORTS — NO LOGIC CHANGE
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

/* ---------- Helpers (unchanged) ---------- */
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}
function moneyWith(symbol, n) {
  return `${symbol}${Number(n || 0).toFixed(2)}`;
}

/* ---------- Status helpers ---------- */
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

/* ---------- Currency ---------- */
const CURRENCY_OPTIONS = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

/* ---------- Dashboard ---------- */
export default function Dashboard() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  /* ---------- Popup ---------- */
  const [popup, setPopup] = useState({ open: false });
  const showPopup = (p) => setPopup({ open: true, ...p });
  const closePopup = () => setPopup({ open: false });

  /* ---------- Fetch invoices ---------- */
  useEffect(() => {
    (async () => {
      try {
        setLoadingList(true);
        const res = await fetch(
          `https://paychase-backend.onrender.com/api/documents?status=${filter}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setDocuments(data.documents || []);
      } catch {
        showPopup({ title: "Error", message: "Failed to load invoices" });
      } finally {
        setLoadingList(false);
      }
    })();
  }, [filter]);

  /* ---------- Search ---------- */
  const filteredDocs = useMemo(() => {
    const q = search.toLowerCase();
    return documents.filter(
      (d) =>
        d.documentNumber?.toLowerCase().includes(q) ||
        d.client?.name?.toLowerCase().includes(q)
    );
  }, [documents, search]);

  return (
    <>
      <Popup {...popup} onClose={closePopup} />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 px-3 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto">

          {/* ---------- Header ---------- */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border shadow-sm text-sm">
                <FileText className="h-4 w-4 text-emerald-600" />
                Invoice Dashboard
              </div>
              <h1 className="mt-3 text-3xl md:text-4xl font-extrabold">
                PayChase Invoices
              </h1>
            </div>

            <button
              onClick={() => navigate("/document")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold"
            >
              <Plus className="h-5 w-5" />
              Create Invoice
            </button>
          </div>

          {/* ---------- Filters + Search ---------- */}
          <div className="bg-white rounded-2xl border shadow-sm p-4 mb-5">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">

              <div className="flex flex-wrap gap-2">
                {["ALL", "PENDING", "PAID"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold border
                      ${filter === f
                        ? "bg-emerald-600 text-white"
                        : "bg-white hover:bg-gray-50"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-[320px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search invoice / client"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* ---------- Content ---------- */}
          {loadingList ? (
            <div className="text-gray-600">Loading invoices…</div>
          ) : filteredDocs.length === 0 ? (
            <div className="bg-white rounded-2xl border p-6">
              No invoices found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocs.map((doc) => {
                const s = statusPill(doc.status);
                const Icon = s.icon;

                return (
                  <div
                    key={doc._id}
                    className="bg-white rounded-2xl border shadow-sm p-4"
                  >
                    {/* Mobile Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                          <div className="font-bold">
                            {doc.documentNumber}
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mt-1">
                          {doc.client?.name}
                        </div>

                        <div className="mt-2 inline-flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
                            <Icon className="inline h-3 w-3 mr-1" />
                            {s.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            Due: {formatDate(doc.dueDate)}
                          </span>
                        </div>
                      </div>

                      {/* Amount + Actions */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-lg font-extrabold">
                          ₹{doc.grandTotal}
                        </div>

                        <div className="flex gap-2">
                          <button
                            className="p-2 rounded-lg border hover:bg-gray-50"
                            title="Download"
                          >
                            <Download className="h-5 w-5" />
                          </button>

                          <button
                            className="p-2 rounded-lg border hover:bg-gray-50"
                            title="Reminder"
                          >
                            <Bell className="h-5 w-5 text-emerald-600" />
                          </button>

                          <button
                            className="px-3 py-2 rounded-lg border font-semibold hover:bg-gray-50"
                          >
                            {doc.status === "PAID" ? "Paid" : "Mark Paid"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
