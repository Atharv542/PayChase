import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function symbolOf(doc) {
  return doc?.currency?.symbol || "₹";
}

export default function DocumentReady() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await fetch(
          `https://paychase-backend.onrender.com/api/documents/${id}`,
          { credentials: "include" }
        );

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          alert(data?.error || data?.message || "Failed to load invoice");
          return;
        }

        if (isMounted) setDoc(data.document);
      } catch {
        alert("Server error / CORS issue");
      } finally {
        if (isMounted) setLoadingDoc(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch(
        `https://paychase-backend.onrender.com/api/documents/${id}/pdf`,
        { credentials: "include" }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || data?.message || "Failed to download PDF");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `INVOICE-${doc?.client?.name || "document"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  if (loadingDoc) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-gray-600">Loading…</div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-gray-600">Invoice not found</div>
      </div>
    );
  }

  const issue = doc.issueDate
    ? new Date(doc.issueDate).toISOString().slice(0, 10)
    : "-";

  const due = doc.dueDate
    ? new Date(doc.dueDate).toISOString().slice(0, 10)
    : "-";

  const total = Number(doc.grandTotal || 0).toFixed(2);
  const sym = symbolOf(doc);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="check shrink-0 mx-auto sm:mx-0">
            <div className="checkmark">✓</div>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice saved ✅
            </h1>
            <p className="text-gray-600">
              Your invoice is ready. Download whenever you want.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="border rounded-xl p-4 bg-gray-50">
            <div className="text-xs text-gray-500">Invoice Number</div>
            <div className="font-semibold break-all">
              {doc.documentNumber}
            </div>

            <div className="text-xs text-gray-500 mt-3">Client</div>
            <div className="font-semibold break-words">
              {doc.client?.name}
            </div>

            <div className="text-xs text-gray-500 mt-3">Issue Date</div>
            <div className="font-semibold">{issue}</div>
          </div>

          <div className="border rounded-xl p-4 bg-gray-50">
            <div className="text-xs text-gray-500">Total</div>
            <div className="font-bold text-2xl text-emerald-700">
              {sym}
              {total}
            </div>

            <div className="text-xs text-gray-500 mt-3">Due Date</div>
            <div className="font-semibold">{due}</div>

            <div className="text-xs text-gray-500 mt-3">Items</div>
            <div className="font-semibold">
              {Array.isArray(doc.items) ? doc.items.length : 0}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={downloadPdf}
            disabled={downloading}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
          >
            {downloading ? "Downloading..." : "Download PDF"}
          </button>

          <button
            onClick={() => navigate("/create-document")}
            className="w-full py-3 rounded-xl border font-semibold hover:bg-gray-50"
          >
            Create New
          </button>
        </div>

        {/* Animation styles */}
        <style>{`
          .check {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            background: linear-gradient(135deg,#34d399,#10b981);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 24px rgba(16,185,129,0.25);
            animation: pop 420ms ease-out;
          }
          .checkmark {
            color: white;
            font-size: 28px;
            font-weight: 900;
          }
          @keyframes pop {
            0% {
              transform: scale(0.85);
              opacity: 0.4;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
