import { useState } from "react";
import { Mail, Lock, User, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  setLoading(true);

  try {
    // 1️⃣ Register
    const res = await fetch(
      "https://paychase-backend.onrender.com/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      }
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.error || data?.message || "Registration failed");
      return;
    }

    // 2️⃣ Verify session (mobile fix)
    let meRes = await fetch(
      "https://paychase-backend.onrender.com/api/auth/me",
      { credentials: "include" }
    );

    if (!meRes.ok) {
      // mobile browsers need a moment
      await new Promise((r) => setTimeout(r, 300));

      meRes = await fetch(
        "https://paychase-backend.onrender.com/api/auth/me",
        { credentials: "include" }
      );

      if (!meRes.ok) {
        alert("Session could not be established. Please login.");
        navigate("/login", { replace: true });
        return;
      }
    }

    // 3️⃣ Prevent navbar popup
    sessionStorage.setItem("justLoggedIn", "true");
    localStorage.setItem("wasLoggedIn", "true");
    window.dispatchEvent(new Event("auth-changed"));
    // 4️⃣ Safe redirect
    navigate("/business-profile", { replace: true });
  } catch (err) {
    console.log("Signup error:", err);
    alert("Server error / CORS issue");
  } finally {
    setLoading(false);
  }
};


  const IMAGE_SRC =
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-200 rounded-full blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-300 rounded-full blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="w-full px-4 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-emerald-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>

            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-xl font-bold hidden sm:block">
                PayChase
              </span>
            </button>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
            {/* Form */}
            <div>
              <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 border">
                <h2 className="text-4xl font-bold mb-3">
                  Create your account
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Start getting paid on time today
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a password"
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold disabled:opacity-60"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                <p className="text-center text-sm mt-6">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-emerald-600 font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <img
                  src={IMAGE_SRC}
                  alt="Business growth"
                  className="w-full h-[600px] object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Benefits strip */}
        <div className="text-center pb-10">
          <div className="flex justify-center gap-6 flex-wrap text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Free forever plan
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Setup in 5 minutes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
