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

/* =========================================================
   🔐 AUTH FETCH HELPER (TOKEN BASED)
   ========================================================= */
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return { status: 401 };
  }

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

/* ========================================================= */

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

function moneyWith(symbol, n) {
  return `${symbol}${Number(n || 0).toFixed(2)}`;
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

export default function Dashboard() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genLoadingId, setGenLoadingId] = useState(null);
  const [payLoadingId, setPayLoadingId] = useState(null);

  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    primaryText: "OK",
    onPrimary: null,
  });

  const showPopup = (opts) => setPopup({ open: true, ...opts });
  const closePopup = () => setPopup((p) => ({ ...p, open: false }));

  /* =========================================================
     🚨 SESSION EXPIRED HANDLER
     ========================================================= */
  const handle401 = () => {
    localStorage.removeItem("accessToken");

    showPopup({
      title: "Session expired",
      message: "Your login session expired. Please login again.",
      primaryText: "Go to Login",
      onPrimary: () => navigate("/login", { replace: true }),
    });
  };

  /* =========================================================
     📥 FETCH DOCUMENTS
     ========================================================= */
  const fetchDocs = async () => {
    try {
      setLoading(true);

      const res = await authFetch(
        `https://paychase-backend.onrender.com/api/documents?status=${filter}`
      );

      if (res.status === 401) return handle401();

      const data = await res.json();

      if (!res.ok) {
        showPopup({
          title: "Error",
          message: data?.error || "Failed to load invoices",
          onPrimary: closePopup,
        });
        return;
      }

      setDocuments(data.documents || []);
    } catch {
      showPopup({
        title: "Server Error",
        message: "Could not load invoices.",
        onPrimary: closePopup,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
    // eslint-disable-next-line
  }, [filter]);

  /* =========================================================
     📄 DOWNLOAD PDF (TOKEN SAFE)
     ========================================================= */
  const downloadInvoice = (doc) => {
    const token = localStorage.getItem("accessToken");

    window.open(
      `https://paychase-backend.onrender.com/api/documents/${doc._id}/pdf?token=${token}`,
      "_blank"
    );
  };

  /* =========================================================
     🤖 GENERATE AI REMINDER
     ========================================================= */
  const generateReminder = async (doc) => {
    try {
      setGenLoadingId(doc._id);

      const res = await authFetch(
        `https://paychase-backend.onrender.com/api/ai/reminder/${doc._id}`,
        { method: "POST" }
      );

      if (res.status === 401) return handle401();

      const data = await res.json();

      showPopup({
        title: "Reminder Generated",
        message: data.message || "Reminder created successfully.",
        onPrimary: closePopup,
      });
    } catch {
      showPopup({
        title: "Error",
        message: "Failed to generate reminder.",
        onPrimary: closePopup,
      });
    } finally {
      setGenLoadingId(null);
    }
  };

  /* =========================================================
     ✅ TOGGLE PAID
     ========================================================= */
  const togglePaid = async (doc) => {
    try {
      setPayLoadingId(doc._id);

      const next = doc.status === "PAID" ? "PENDING" : "PAID";

      const res = await authFetch(
        `https://paychase-backend.onrender.com/api/documents/${doc._id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: next }),
        }
      );

      if (res.status === 401) return handle401();

      const data = await res.json();

      setDocuments((prev) =>
        prev.map((d) => (d._id === doc._id ? data.document : d))
      );
    } catch {
      showPopup({
        title: "Error",
        message: "Could not update invoice status.",
        onPrimary: closePopup,
      });
    } finally {
      setPayLoadingId(null);
    }
  };

  /* ========================================================= */

  const filteredDocs = useMemo(() => {
    const q = search.toLowerCase();
    return documents.filter(
      (d) =>
        d.documentNumber.toLowerCase().includes(q) ||
        d.client?.name?.toLowerCase().includes(q)
    );
  }, [documents, search]);

  return (
    <>
      <Popup
        open={popup.open}
        title={popup.title}
        message={popup.message}
        primaryText={popup.primaryText}
        onPrimary={popup.onPrimary || closePopup}
        onClose={closePopup}
      />

      <div className="min-h-screen p-6 bg-gradient-to-br from-emerald-50 via-white to-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between mb-6">
            <h1 className="text-3xl font-bold">Invoice Dashboard</h1>
            <button
              onClick={() => navigate("/document")}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl"
            >
              <Plus className="inline mr-1" /> Create Invoice
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : filteredDocs.length === 0 ? (
            <p>No invoices found.</p>
          ) : (
            filteredDocs.map((doc) => {
              const s = statusPill(doc.status);
              const Icon = s.icon;

              return (
                <div
                  key={doc._id}
                  className="bg-white rounded-xl p-4 mb-3 border flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold">{doc.documentNumber}</div>
                    <div className="text-sm text-gray-500">
                      {doc.client?.name}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${s.cls}`}>
                      <Icon className="inline h-3 w-3 mr-1" />
                      {s.label}
                    </span>

                    <button onClick={() => downloadInvoice(doc)}>
                      <Download />
                    </button>

                    <button onClick={() => generateReminder(doc)}>
                      <Bell />
                    </button>

                    <button onClick={() => togglePaid(doc)}>
                      {payLoadingId === doc._id ? "..." : "Toggle"}
                    </button>
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
