
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../utils/authFetch"; // ✅ TOKEN FETCH
import Popup from "./PopUp";
import {
  Receipt,
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Plus,
  X,
  Calculator,
  Save,
  Loader2,
  FileSignature,
  Wand2,
} from "lucide-react";

export default function CreateDocument() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [rewriteLoading, setRewriteLoading] = useState(false);

  const [issueDate, setIssueDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState("");

  const [client, setClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [items, setItems] = useState([
    { name: "", qty: 1, rate: 0, taxPercent: 0, discount: 0 },
  ]);

  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  const [currency, setCurrency] = useState({
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
  });

  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [currencyLoading, setCurrencyLoading] = useState(false);

  /* =========================================================
     🔔 POPUP
     ========================================================= */
  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    primaryText: "OK",
    secondaryText: "",
    onPrimary: null,
    onSecondary: null,
  });

  const showPopup = (opts) => setPopup({ open: true, ...opts });
  const closePopup = () => setPopup((p) => ({ ...p, open: false }));

  /* =========================================================
     💱 LOAD CURRENCIES (PUBLIC API – NO AUTH)
     ========================================================= */
  useEffect(() => {
    (async () => {
      try {
        setCurrencyLoading(true);
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,currencies"
        );
        const data = await res.json();

        const seen = new Set();
        const list = [];

        for (const c of data) {
          const currencies = c.currencies || {};
          for (const code of Object.keys(currencies)) {
            if (!seen.has(code)) {
              seen.add(code);
              list.push({
                code,
                name: currencies[code].name || code,
                symbol: currencies[code].symbol || code,
              });
            }
          }
        }

        setCurrencyOptions(list.sort((a, b) => a.code.localeCompare(b.code)));
      } catch (e) {
        console.error(e);
      } finally {
        setCurrencyLoading(false);
      }
    })();
  }, []);

  /* =========================================================
     🧮 TOTALS
     ========================================================= */
  const totals = useMemo(() => {
    let subtotal = 0,
      discountTotal = 0,
      taxTotal = 0;

    for (const it of items) {
      const base = it.qty * it.rate;
      const afterDiscount = Math.max(base - it.discount, 0);
      const tax = (afterDiscount * it.taxPercent) / 100;

      subtotal += base;
      discountTotal += it.discount;
      taxTotal += tax;
    }

    return {
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal: subtotal - discountTotal + taxTotal,
    };
  }, [items]);

  /* =========================================================
     🔐 ENSURE PROFILE (TOKEN BASED)
     ========================================================= */
  const ensureProfileExists = async () => {
    const res = await authFetch(
      "https://paychase-backend.onrender.com/api/profile/exists"
    );

    if (res.status === 401) {
      showPopup({
        title: "Session expired",
        message: "Please login again.",
        onPrimary: () => navigate("/login", { replace: true }),
      });
      return false;
    }

    const data = await res.json();
    if (!data.exists) {
      showPopup({
        title: "Business Profile Required",
        message: "Create your business profile first.",
        primaryText: "Create Profile",
        onPrimary: () => navigate("/business-profile"),
      });
      return false;
    }

    return true;
  };

  /* =========================================================
     🤖 AI REWRITE (TOKEN BASED)
     ========================================================= */
  const handleRewriteWithAI = async () => {
    const ok = await ensureProfileExists();
    if (!ok) return;

    setRewriteLoading(true);
    try {
      const res = await authFetch(
        "https://paychase-backend.onrender.com/api/rewrite/rewrite-items",
        {
          method: "POST",
          body: JSON.stringify({
            clientName: client.name,
            currency: currency.code,
            items,
          }),
        }
      );

      if (res.status === 401) return navigate("/login");

      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
    } catch (e) {
      console.error(e);
    } finally {
      setRewriteLoading(false);
    }
  };

  /* =========================================================
     💾 SUBMIT DOCUMENT (TOKEN BASED)
     ========================================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const ok = await ensureProfileExists();
    if (!ok) return;

    setLoading(true);
    try {
      const res = await authFetch(
        "https://paychase-backend.onrender.com/api/documents",
        {
          method: "POST",
          body: JSON.stringify({
            type: "INVOICE",
            issueDate,
            dueDate: dueDate || null,
            currency,
            client,
            items,
            notes,
            terms,
          }),
        }
      );

      if (res.status === 401) return navigate("/login");

      const data = await res.json();
      navigate(`/documents/${data.document._id}/ready`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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

      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100">
              <Receipt className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Invoice</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Invoice number is generated automatically by the system.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <section className="bg-white rounded-xl sm:rounded-2xl border shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Invoice Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Currency
                  </label>
                  <select
                    value={currency.code}
                    onChange={(e) => {
                      const selected = currencyOptions.find((o) => o.code === e.target.value);
                      if (selected) {
                        setCurrency({
                          code: selected.code,
                          symbol: selected.symbol,
                          name: selected.name,
                        });
                      }
                    }}
                    className="w-full text-sm sm:text-base border rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    {currencyOptions.map((op) => (
                      <option key={op.code} value={op.code}>
                        {op.code} ({op.symbol}) - {op.name}
                      </option>
                    ))}
                  </select>
                  {currencyLoading && (
                    <div className="text-xs text-gray-500 mt-1">Loading currencies…</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                      Issue Date
                    </span>
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full text-sm sm:text-base border rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                      Due Date
                    </span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-sm sm:text-base border rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl sm:rounded-2xl border shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Client Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full text-sm sm:text-base border rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Enter client name"
                    value={client.name}
                    onChange={(e) => setClient({ ...client, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                      Email
                    </span>
                  </label>
                  <input
                    className="w-full text-sm sm:text-base border rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="client@example.com"
                    type="email"
                    value={client.email}
                    onChange={(e) => setClient({ ...client, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                      Phone
                    </span>
                  </label>
                  <input
                    className="w-full text-sm sm:text-base border rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="+91 98765 43210"
                    value={client.phone}
                    onChange={(e) => setClient({ ...client, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                      Address
                    </span>
                  </label>
                  <input
                    className="w-full text-sm sm:text-base border rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Street, City, State"
                    value={client.address}
                    onChange={(e) => setClient({ ...client, address: e.target.value })}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl sm:rounded-2xl border shadow-sm p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Line Items</h2>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRewriteWithAI}
                    disabled={rewriteLoading}
                    className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm sm:text-base font-semibold hover:bg-emerald-100 disabled:opacity-60 whitespace-nowrap"
                  >
                    {rewriteLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Rewriting...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Rewrite with AI
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-emerald-600 text-white text-sm sm:text-base font-medium hover:bg-emerald-700 transition whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border space-y-3"
                  >
                    <div className="grid grid-cols-1 gap-3">
                      <input
                        className="w-full text-sm sm:text-base border rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        placeholder="Item name"
                        value={it.name}
                        onChange={(e) => updateItem(idx, "name", e.target.value)}
                      />

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                          <input
                            type="number"
                            min={1}
                            className="w-full text-sm sm:text-base border rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-center outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            value={it.qty}
                            onChange={(e) => updateItem(idx, "qty", Number(e.target.value))}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Rate</label>
                          <input
                            type="number"
                            min={0}
                            className="w-full text-sm sm:text-base border rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-center outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            value={it.rate}
                            onChange={(e) => updateItem(idx, "rate", Number(e.target.value))}
                            placeholder={currency.symbol}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Tax %</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            className="w-full text-sm sm:text-base border rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-center outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            value={it.taxPercent}
                            onChange={(e) => updateItem(idx, "taxPercent", Number(e.target.value))}
                            placeholder="%"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Discount</label>
                          <input
                            type="number"
                            min={0}
                            className="w-full text-sm sm:text-base border rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-center outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            value={it.discount}
                            onChange={(e) => updateItem(idx, "discount", Number(e.target.value))}
                            placeholder={currency.symbol}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        disabled={items.length === 1}
                        className="p-2 rounded-lg sm:rounded-xl border bg-white text-gray-600 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-40"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-xl sm:rounded-2xl border shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Summary</h2>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-xl sm:rounded-2xl border bg-gray-50 p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-600">Subtotal</div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                    {currency.symbol}{totals.subtotal.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-xl sm:rounded-2xl border bg-gray-50 p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-600">Discount</div>
                  <div className="text-lg sm:text-xl font-bold text-red-600 mt-1">
                    -{currency.symbol}{totals.discountTotal.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-xl sm:rounded-2xl border bg-gray-50 p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-600">Tax</div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                    {currency.symbol}{totals.taxTotal.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-xl sm:rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3 sm:p-4">
                  <div className="text-xs sm:text-sm font-semibold text-emerald-700">Grand Total</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-1">
                    {currency.symbol}{totals.grandTotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl sm:rounded-2xl border shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <FileSignature className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Additional Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full text-sm sm:text-base border rounded-xl sm:rounded-2xl px-2.5 sm:px-3 py-2 sm:py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Any notes for the client..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    rows={4}
                    className="w-full text-sm sm:text-base border rounded-xl sm:rounded-2xl px-2.5 sm:px-3 py-2 sm:py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Payment terms, delivery conditions..."
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-base sm:text-lg shadow-md hover:shadow-lg transition disabled:opacity-60 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Save Invoice
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
