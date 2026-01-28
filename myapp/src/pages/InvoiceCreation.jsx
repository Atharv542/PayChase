import { useState } from "react";
import { Upload, Check } from "lucide-react";

export default function InvoiceCreation({ onNavigate }) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientWhatsApp: "",
    invoiceNumber: "",
    invoiceAmount: "",
    dueDate: "",
    reminderChannel: "email",
    reminderTone: "professional",
  });

  const [selectedReminders, setSelectedReminders] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  /* ---------------- SUCCESS STATE ---------------- */
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Invoice Created Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your payment reminder automation is now active.
            </p>

            {/* SUMMARY */}
            <div className="bg-gray-50 rounded-lg p-5 mb-6 text-left">
              <h3 className="font-semibold text-lg mb-4">
                Invoice Summary
              </h3>

              <div className="space-y-3 text-sm">
                {[
                  ["Invoice Number", formData.invoiceNumber],
                  ["Client Name", formData.clientName],
                  ["Amount", `₹${formData.invoiceAmount}`],
                  ["Due Date", formData.dueDate],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-3"
                  >
                    <span className="text-gray-600">{label}:</span>
                    <span className="font-medium text-gray-900 text-right">
                      {value}
                    </span>
                  </div>
                ))}

                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    UNPAID
                  </span>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setSubmitted(false)}
                className="w-full px-4 py-2 border-2 border-emerald-500 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition"
              >
                Create Another Invoice
              </button>

              <button
                onClick={() => onNavigate("dashboard")}
                className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium shadow hover:shadow-md transition"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- FORM STATE ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Create Invoice
          </h1>
          <p className="text-gray-600">
            Set up your invoice and automate payment reminders
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CLIENT INFO */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
            <h2 className="text-xl font-semibold mb-5">
              Client Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                ["Client Name", "clientName", "John Doe", "text", true],
                ["Client Email", "clientEmail", "john@example.com", "email", true],
                ["Client WhatsApp", "clientWhatsApp", "+91 98765 43210", "tel", false],
              ].map(([label, name, placeholder, type, required]) => (
                <div key={name}>
                  <label className="block text-sm font-medium mb-2">
                    {label} {required && "*"}
                  </label>
                  <input
                    type={type}
                    name={name}
                    required={required}
                    value={formData[name]}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* INVOICE DETAILS */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
            <h2 className="text-xl font-semibold mb-5">
              Invoice Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                ["Invoice Number", "invoiceNumber", "INV-001", "text"],
                ["Invoice Amount (₹)", "invoiceAmount", "50000", "number"],
                ["Due Date", "dueDate", "", "date"],
              ].map(([label, name, placeholder, type]) => (
                <div key={name}>
                  <label className="block text-sm font-medium mb-2">
                    {label} *
                  </label>
                  <input
                    type={type}
                    name={name}
                    required
                    value={formData[name]}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Upload Invoice PDF
                </label>
                <div className="border-2 border-dashed rounded-lg p-5 text-center hover:border-emerald-500 cursor-pointer transition">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload PDF
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium shadow hover:shadow-md transition"
          >
            Activate Reminder Automation
          </button>
        </form>
      </div>
    </div>
  );
}
