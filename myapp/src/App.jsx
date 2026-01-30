import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";

import Home from "./pages/Home";

import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BusinessProfile from "./pages/BusinessProfile";
import CreateDocument from "./pages/CreateDocument";
import DocumentReady from "./pages/DocumentReady";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

function App() {
  const location = useLocation();
  const hideNavbarFooter =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />

      {!hideNavbarFooter && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
         
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/business-profile" element={<BusinessProfile />} />
          <Route path="/document" element={<CreateDocument />} />
          <Route path="/documents/:id/ready" element={<DocumentReady />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!hideNavbarFooter && <Footer />}
    </div>
  );
}

export default App;
