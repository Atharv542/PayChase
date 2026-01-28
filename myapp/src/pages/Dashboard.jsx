import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "./PopUp";
import {
  Plus,
  Download,
  Bell,
  CheckCircle2,
  Clock3,
  Search,
  FileText,
} from "lucide-react";

/* ---------- Helpers ---------- */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toISOString().slice(0, 10);
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
        showPopup({ title: "Error", message: data?.error || "Failed" });
        return;
      }

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
        showPopup({ title: "Error", message: data?.error || "Failed" });
        return;
      }

      setDocuments((prev) =>
        prev.map((d) => (d._id === doc._id ? data.document : d))
      );
    } catch {
      showPopup({ title: "Error", message: "Update failed" });
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
      <Popup {...popup} onClose={closePopup} />

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between mb-6">
            <h1 className="text-3xl font-bold">Invoices</h1>
            <button
              onClick={() => navigate("/document")}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl"
            >
              <Plus className="inline mr-1" /> Create
            </button>
          </div>

          {/* Search */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-xl w-full"
              placeholder="Search invoice / client"
            />
          </div>

          {/* List */}
          {loadingList ? (
            <div>Loading…</div>
          ) : filteredDocs.length === 0 ? (
            <div>No invoices</div>
          ) : (
            filteredDocs.map((doc) => {
              const s = statusPill(doc.status);
              const Icon = s.icon;

              return (
                <div key={doc._id} className="bg-white p-4 rounded-xl mb-3 border">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">{doc.documentNumber}</div>
                      <div className="text-sm text-gray-500">
                        {doc.client?.name}
                      </div>
                      <span className={`text-xs px-2 py-1 border rounded ${s.cls}`}>
                        <Icon className="inline h-3 w-3 mr-1" />
                        {s.label}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => downloadInvoice(doc)}>
                        <Download />
                      </button>
                      <button onClick={() => generateReminder(doc)}>
                        <Bell />
                      </button>
                      <button onClick={() => togglePaid(doc)}>
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
