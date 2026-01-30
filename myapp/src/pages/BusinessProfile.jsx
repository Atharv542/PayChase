import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "./PopUp";
import {
  Upload,
  Building2,
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
  FileText,
  X,
} from "lucide-react";

export default function BusinessProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    phone: "",
    email: "",
    address: "",
    gstin: "",
    defaultTerms: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: name === "gstin" ? value.toUpperCase() : value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type) || file.size > 2 * 1024 * 1024) {
      showPopup({
        title: "Invalid file",
        message: "Upload PNG/JPG/WEBP under 2MB.",
        onPrimary: closePopup,
      });
      return;
    }

    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview("");
    setLogoFile(null);
  };

  const gstinInfo = useMemo(() => {
    const g = formData.gstin.trim();
    if (!g) return { show: false, ok: true, msg: "" };
    if (g.length !== 15)
      return { show: true, ok: false, msg: "GSTIN must be 15 characters." };

    const re =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return re.test(g)
      ? { show: true, ok: true, msg: "GSTIN looks valid ✅" }
      : { show: true, ok: false, msg: "Invalid GSTIN format." };
  }, [formData.gstin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (gstinInfo.show && !gstinInfo.ok) {
      showPopup({ title: "Invalid GSTIN", message: gstinInfo.msg });
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (logoFile) fd.append("logo", logoFile);

      const res = await fetch("https://paychase-backend.onrender.com/api/profile", {
        method: "PUT",
        credentials: "include",
        body: fd,
      });

      if (!res.ok) throw new Error("Failed");

      showPopup({
        title: "Saved ✅",
        message: "Business profile saved successfully.",
        primaryText: "Create Invoice",
        onPrimary: () => navigate("/document"),
      });
    } catch {
      showPopup({
        title: "Error",
        message: "Server error / CORS issue",
      });
    } finally {
      setLoading(false);
    }
  };

  const tips = [
    "Upload a clear square logo.",
    "Company info appears on invoices.",
    "Terms auto-fill during invoice creation.",
  ];

  return (
    <>
      <Popup {...popup} onClose={closePopup} />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border rounded-full text-sm">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                Business Profile
              </div>
              <h1 className="mt-3 text-3xl font-bold">
                Set up your <span className="text-emerald-600">PayChase</span> brand
              </h1>
              <p className="text-gray-600 mt-1 max-w-xl">
                Your business details will be used on every invoice PDF.
              </p>
            </div>

            <button
              onClick={() => navigate("/", { replace: true })}
              className="hidden sm:block px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
            >
              Back to Home
            </button>
          </div>

          {/* Layout */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow border p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Company */}
                  <Input
                    icon={Building2}
                    label="Company Name *"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                  />

                  {/* Logo */}
                  <div className="border rounded-2xl p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Upload className="h-5 w-5 text-emerald-600" />
                        <div>
                          <div className="font-semibold">Company Logo</div>
                          <div className="text-sm text-gray-500">
                            PNG/JPG/WEBP • 2MB max
                          </div>
                        </div>
                      </div>

                      <label className="px-4 py-2 bg-emerald-600 text-white rounded-xl cursor-pointer text-center">
                        Choose File
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleLogoChange}
                        />
                      </label>
                    </div>

                    {logoPreview && (
                      <div className="mt-4 flex items-center gap-4">
                        <img
                          src={logoPreview}
                          className="w-16 h-16 rounded-xl border object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="ml-auto p-2 border rounded-xl"
                        >
                          <X />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input icon={Phone} label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                    <Input icon={Mail} label="Email" name="email" value={formData.email} onChange={handleChange} />
                  </div>

                  {/* Address */}
                  <Textarea icon={MapPin} label="Address" name="address" value={formData.address} onChange={handleChange} />

                  {/* GST + Terms */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input label="GSTIN" name="gstin" value={formData.gstin} onChange={handleChange} />
                    <Input label="Default Terms" name="defaultTerms" value={formData.defaultTerms} onChange={handleChange} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Save Profile"}
                  </button>
                </form>
              </div>
            </div>

            {/* Side Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow border p-6 lg:sticky lg:top-24">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="text-emerald-600" />
                  <h3 className="font-bold">Why this matters</h3>
                </div>
                <ul className="space-y-3">
                  {tips.map((t) => (
                    <li key={t} className="text-sm text-gray-600">
                      • {t}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => navigate("/", { replace: true })}
                className="sm:hidden mt-4 w-full px-4 py-2 rounded-xl border bg-white"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


function Input({ icon: Icon, label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />}
        <input
          {...props}
          className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500`}
        />
      </div>
    </div>
  );
}

function Textarea({ icon: Icon, label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />}
        <textarea
          {...props}
          rows={3}
          className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500`}
        />
      </div>
    </div>
  );
}
