import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Popup from "../pages/PopUp";


export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const shownSessionPopup = useRef(false);

  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    primaryText: "OK",
    onPrimary: null,
  });

  const showPopup = (opts) => setPopup({ open: true, ...opts });
  const closePopup = () => setPopup((p) => ({ ...p, open: false }));

  const menuItems = [
    { name: "Home", path: "/",scroll:"home" },
    { name: "Features",path:'/#features', scroll: "features" },
    { name: "How It Works", scroll: "works" },
    
    { name: "Dashboard", path: "/dashboard" },
    { /*name: "Pricing", path: "/pricing" */},
  ];

  const isActive = (item) => {
    if (item.path === "/") return location.pathname === "/";
    return location.pathname === item.path;
  };

  const scrollToId = (id) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleNavigation = (itemOrPath) => {
    const item =
      typeof itemOrPath === "string" ? { path: itemOrPath } : itemOrPath;

    if (item.path && location.pathname === item.path) {
      if (item.scroll) scrollToId(item.scroll);
      setIsMobileMenuOpen(false);
      setOpenUserMenu(false);
      return;
    }

    navigate(item.path);

    if (item.scroll) setTimeout(() => scrollToId(item.scroll), 50);

    setIsMobileMenuOpen(false);
    setOpenUserMenu(false);
  };

  const fetchMe = async () => {
  try {
    setLoadingUser(true);

    const res = await fetch("https://paychase-backend.onrender.com/api/auth/me", {
      credentials: "include",
    });

    if (res.status === 401) {
      setUser(null);

      // ✅ show popup ONLY if user had logged in before
      const wasLoggedIn = localStorage.getItem("wasLoggedIn") === "true";

      if (wasLoggedIn && !shownSessionPopup.current && location.pathname !== "/login") {
        shownSessionPopup.current = true;

        showPopup({
          title: "Session expired",
          message: "Your login session expired. Please login again.",
          primaryText: "Go to Login",
          onPrimary: () => navigate("/login", { replace: true }),
        });
      }

      return;
    }

    if (!res.ok) {
      setUser(null);
      return;
    }

    const data = await res.json();
    setUser(data.user || null);

    // ✅ if me works, user is logged in
    localStorage.setItem("wasLoggedIn", "true");
  } catch {
    setUser(null);
  } finally {
    setLoadingUser(false);
  }
};


  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

 const handleLogout = async () => {
  try {
    await fetch("https://paychase-backend.onrender.com/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } finally {
    localStorage.removeItem("wasLoggedIn"); // ✅ important
    setUser(null);
    setOpenUserMenu(false);
    setIsMobileMenuOpen(false);
    navigate("/login", { replace: true });
  }
};


  const displayName = user?.username || user?.email || "Account";

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

      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => handleNavigation("/")}
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-xl font-bold text-gray-900">PayChase</span>
              </div>
            </div>

            <div className="hidden  md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className={`text-sm cursor-pointer font-medium transition-colors ${
                  "text-gray-600 hover:text-emerald-600"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => handleNavigation(user ? "/document" : "/login")}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md"
              >
                Get Started
              </button>

              {loadingUser ? null : !user ? (
                <button
                  onClick={() => handleNavigation("/login")}
                  className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  Login
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setOpenUserMenu((v) => !v)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {displayName}
                  </button>

                  {openUserMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md overflow-hidden">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive(item)
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.name}
                </button>
              ))}

              <div className="pt-3 space-y-2 border-t">
                {loadingUser ? null : !user ? (
                  <>
                    <button
                      onClick={() => handleNavigation("/login")}
                      className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Login
                    </button>
                    <button
                     onClick={() => handleNavigation(user ? "/document" : "/login")}
                      className="block w-full px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-lg"
                    >
                      Get Started
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2 text-sm font-medium text-gray-700">
                      {displayName}
                    </div>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
