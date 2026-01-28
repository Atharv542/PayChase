import { useEffect, useMemo, useState } from "react";
import {useNavigate} from 'react-router-dom'
import {
  FileText,
  Settings,
  Download,
  Calculator,
  LayoutTemplate,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const navigate= useNavigate()
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const isUserLoggedIn = async () => {
  try {
    const res = await fetch("https://paychase-wsds.onrender.com/api/auth/me", {
      credentials: "include",
    });

    if (res.status === 401) {
      navigate("/login");
      return;
    }

    if (!res.ok) {
      navigate("/login");
      return;
    }

    // ✅ logged in
    navigate("/document");
  } catch (err) {
    navigate("/login");
  }
};


  // ✅ Replace this with your own image later if you want:
  // Put your image in: /src/assets/hero-paychase.jpg
  // Then use: import heroImg from "../assets/hero-paychase.jpg";
  // and set HERO_IMAGE_SRC = heroImg
  const HERO_IMAGE_SRC =
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80";
  // This image is relevant: finance/invoices/billing desk vibe.

  const stats = useMemo(
    () => [
      ["< 2 min", "Setup Time"],
      ["Pro PDF", "Invoice Layout"],
      ["Tax + Disc", "Auto Totals"],
      ["1-click", "Download"],
    ],
    []
  );

    const features = useMemo(
    () => [
      {
        icon: Sparkles,
        title: "AI Reminder Generator (Auto Tone)",
        description:
          "Generate a well-structured reminder in 1 click. Tone is auto-detected (polite/professional/firm) based on due date — no forms to fill.",
      },
      {
        icon: LayoutTemplate,
        title: "AI Line Item Rewriter (Dispute-Proof)",
        description:
          "One click to rewrite vague items into clear, professional scope-based descriptions so clients don’t dispute or misunderstand your work.",
      },
      {
        icon: Calculator,
        title: "Smart Dashboard (Earned + Pending)",
        description:
          "See total invoices created, money earned, and pending amount at a glance. Mark invoices as completed to update totals instantly.",
      },
      {
        icon: Download,
        title: "Premium PDF Download (1-Click)",
        description:
          "Generate a clean, branded invoice/quotation PDF instantly with your business profile and consistent formatting.",
      },
    ],
    []
  );


  const steps = useMemo(
    () => [
      {
        number: "1",
        title: "Set Business Profile",
        description:
          "Add your company details. This becomes your invoice header.",
        icon: Settings,
      },
      {
        number: "2",
        title: "Add Client + Items",
        description:
          "Fill client details and line items with quantity, rate, tax and discount.",
        icon: FileText,
      },
      {
        number: "3",
        title: "Preview Totals",
        description:
          "We calculate subtotal, tax, discount and grand total automatically.",
        icon: CheckCircle,
      },
      {
        number: "4",
        title: "Download PDF",
        description:
          "Get a professional invoice/quotation PDF ready to send to your client.",
        icon: Download,
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* HERO */}
      <section id="home" className="max-w-7xl mx-auto px-4 pt-16 pb-14">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div
            className={[
              "transition-all duration-700 ease-out",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            ].join(" ")}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white shadow-sm text-sm text-gray-700">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>Invoices & Quotations that look premium</span>
            </div>

            <h1 className="mt-5 text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Create Professional
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500">
                Invoice PDFs
              </span>{" "}
              in Minutes.
            </h1>

            <p className="mt-5 text-lg md:text-xl text-gray-600 max-w-2xl">
              Add your business profile once, create invoices or quotations, and
              download clean, branded PDFs with smart totals (tax/discount)
              automatically calculated.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={isUserLoggedIn}
                className="group cursor-pointer px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium shadow-sm hover:shadow-md transition active:scale-[0.99]"
              >
                Create Invoice
                <ArrowRight className="inline-block ml-2 h-4 w-4 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
  const el = document.getElementById("works");
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}}

                className="px-6 cursor-pointer py-3 rounded-lg border-2 border-emerald-500 text-emerald-600 font-medium hover:bg-emerald-50 transition active:scale-[0.99]"
              >
                See how it works
              </button>
            </div>

            {/* Trust line */}
            <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>No design skills needed</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-gray-300" />
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Fast + consistent PDFs</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-gray-300" />
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Tax & discount supported</span>
              </div>
            </div>
          </div>

          {/* Right - Hero Image */}
          <div
            className={[
              "relative transition-all duration-700 ease-out",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            ].join(" ")}
          >
            {/* Decorative blobs */}
            <div className="absolute -top-8 -left-8 w-40 h-40 bg-emerald-200/50 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-orange-200/40 rounded-full blur-2xl animate-pulse" />

            <div className="relative bg-white rounded-2xl shadow-xl border overflow-hidden">
              {/* Image */}
              <div className="relative">
                <img
                  src={HERO_IMAGE_SRC}
                  alt="Professional invoice and billing workspace"
                  className="w-full h-[420px] object-cover"
                  loading="lazy"
                />
                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/45 via-gray-900/10 to-transparent" />
              </div>

              {/* Caption card */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Branded PDFs, every time
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Clean layout • Smart totals • Ready to download
                    </div>
                  </div>
                  <div className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
                    <Download className="h-4 w-4" />
                    PDF
                  </div>
                </div>

                {/* Mini highlights */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border bg-gray-50 p-3">
                    <div className="text-xs text-gray-500 font-semibold">
                      Template
                    </div>
                    <div className="mt-1 text-sm font-bold text-gray-900">
                      Pro
                    </div>
                  </div>
                  <div className="rounded-xl border bg-gray-50 p-3">
                    <div className="text-xs text-gray-500 font-semibold">
                      Totals
                    </div>
                    <div className="mt-1 text-sm font-bold text-gray-900">
                      Auto
                    </div>
                  </div>
                  <div className="rounded-xl border bg-gray-50 p-3">
                    <div className="text-xs text-gray-500 font-semibold">
                      Download
                    </div>
                    <div className="mt-1 text-sm font-bold text-gray-900">
                      1-Click
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating chips */}
          
            <div className="hidden md:flex absolute -right-6 top-16 bg-white border shadow-md rounded-full px-4 py-2 text-sm text-gray-700 items-center gap-2 animate-bounce [animation-duration:2.8s]">
              <Download className="h-4 w-4 text-emerald-600" />
              PDF ready
            </div>
          </div>
        </div>

        {/* STATS */}
        <div
          className={[
            "mt-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-orange-50 p-8 shadow-xl transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          ].join(" ")}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(([value, label]) => (
              <div key={label}>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-600 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-white py-18 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div
            className={[
              "text-center mb-14 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            ].join(" ")}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Generate Premium PDFs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for freelancers and local businesses who want invoices and
              quotations that look professional — fast.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className={[
                    "bg-white rounded-xl p-6 shadow-md border",
                    "hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
                    mounted
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2",
                  ].join(" ")}
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() =>isUserLoggedIn()}
              className="px-6 cursor-pointer py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium shadow hover:shadow-md transition active:scale-[0.99]"
            >
              Create Your First PDF
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="works" className="bg-gray-50 py-18 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div
            className={[
              "text-center mb-16 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            ].join(" ")}
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">How It Works</h2>
            <p className="text-lg text-gray-600">
              Simple flow. Clean result. Professional PDF every time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-4 font-bold text-xl">
                      {step.number}
                    </div>
                    <Icon className="h-8 w-8 text-emerald-600 mb-3" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-emerald-200" />
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-500 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Generate Professional PDFs?
          </h2>
          <p className="text-lg text-emerald-50 mb-8">
            Create your first invoice or quotation and download a premium PDF in
            minutes.
          </p>
          <button
            onClick={isUserLoggedIn}
            className="px-8 cursor-pointer py-3 rounded-lg bg-white text-emerald-600 font-semibold hover:bg-emerald-50 transition shadow active:scale-[0.99]"
          >
            Get Started For Free
          </button>
        </div>
      </section>
    </div>
  );
}
