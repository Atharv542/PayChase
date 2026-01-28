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

/* ---------- Helpers ---------- */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toISOString().slice(0, 10);
}

function money(n) {
  return `₹${Number(n || 0).toFixed(2)}`;
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

/* ---------- Dashboard ---------- */
export default function Dashboard() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    totalReceived: 0,
    totalPending: 0,
  });

  const [loadingList, setLoadingList] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  /* ---------- Popup ---------- */
  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    primaryText: "OK",
    onPrimary: null,
  });

  const showPopup = ({ title, message, primaryText = "OK", onPrimary }) => {
    setPopup({
      open: true,
      title,
      message,
      primaryText,
      onPrimary: onPrimary || (() => setPopup((p) => ({ ...p, open: false }))),
    });
  };

  const closePopup = () =>
    setPopup((p) => ({ ...p, open: false }));

  /* ---------- Fetch invoices ---------- */
  const fetchDocs = async () => {
    try {
      setLoadingList(true);
      const res = await fetch(
        `https://paychase-backend.onrender.com/api/documents?status=${filter}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setDocuments(data.documents || []);
      setSummary(
        data.summary || {
          totalInvoices: 0,
          totalReceived: 0,
          totalPending: 0,
        }
      );
    } catch {
      showPopup({ title: "Error", message: "Failed to load invoices" });
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchDocs();
    // eslint-disable-next-line
  }, [filter]);

  /* ---------- Actions ---------- */
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

      if (!res.ok) {
        showPopup({
          title: "Failed",
          message: data?.error || "Reminder generation failed",
        });
        return;
      }

      showPopup({
        title: "Payment Reminder",
        message: data.message,
        primaryText: "Copy Message",
        onPrimary: async () => {
          await navigator.clipboard.writeText(data.message);
          closePopup();
        },
      });
    } catch {
      showPopup({ title: "Error", message: "AI reminder failed" });
    }
  };

  const togglePaid = async (doc) => {
    try {
      const nextStatus = doc.status === "PAID" ? "PENDING" : "PAID";

      const res = await fetch(
        `https://paychase-backend.onrender.com/api/documents/${doc._id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        showPopup({
          title: "Failed",
          message: data?.error || "Status update failed",
        });
        return;
      }

      setDocuments((prev) =>
        prev.map((d) => (d._id === doc._id ? data.document : d))
      );
      fetchDocs();
    } catch {
      showPopup({ title: "Error", message: "Could not update status" });
    }
  };

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
      {/* Popup */}
      <Popup
        open={popup.open}
        title={popup.title}
        message={
          <pre className="whitespace-pre-wrap text-sm leading-relaxed">
            {popup.message}
          </pre>
        }
        primaryText={popup.primaryText}
        onPrimary={popup.onPrimary}
        onClose={closePopup}
      />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 p-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border text-sm">
                <FileText className="h-4 w-4 text-emerald-600" />
                Invoice Dashboard
              </div>
              <h1 className="mt-3 text-3xl font-extrabold">
                PayChase Invoices
              </h1>
            </div>

            <button
              onClick={() => navigate("/document")}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold"
            >
              <Plus className="inline mr-1" />
              Create Invoice
            </button>
          </div>

          {/* Summary */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <SummaryCard label="Total Invoices" value={summary.totalInvoices} />
            <SummaryCard
              label="Payment Received"
              value={money(summary.totalReceived)}
              green
            />
            <SummaryCard
              label="Pending Amount"
              value={money(summary.totalPending)}
              amber
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border p-4 mb-4 flex justify-between gap-4">
            <div className="flex gap-2">
              {["ALL", "PENDING", "PAID"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl font-semibold border ${
                    filter === f
                      ? "bg-emerald-600 text-white"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="relative w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-xl"
                placeholder="Search invoice / client"
              />
            </div>
          </div>

          {/* List */}
          {loadingList ? (
            <div>Loading invoices…</div>
          ) : filteredDocs.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border">
              No invoices found
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const s = statusPill(doc.status);
              const Icon = s.icon;

              return (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl border p-4 mb-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                        <b>{doc.documentNumber}</b>
                      </div>
                      <div className="text-sm text-gray-500">
                        {doc.client?.name}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 mt-1 border rounded ${s.cls}`}
                      >
                        <Icon className="h-3 w-3" />
                        {s.label}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-lg">
                        {money(doc.grandTotal)}
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
                          className="px-3 py-1 border rounded-lg font-semibold"
                        >
                          {doc.status === "PAID" ? "Paid" : "Mark Paid"}
                        </button>
                      </div>
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

/* ---------- Small component ---------- */
function SummaryCard({ label, value, green, amber }) {
  return (
    <div className="bg-white border rounded-2xl p-5">
      <div className="text-sm text-gray-600">{label}</div>
      <div
        className={`text-3xl font-extrabold ${
          green ? "text-emerald-700" : amber ? "text-amber-700" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
