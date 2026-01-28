import {
  Mail,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
} from "lucide-react";

export default function Footer({ onNavigate }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Brand */}
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-white">
                PayChase
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs mx-auto md:mx-0">
              Automate professional payment reminders and recover
              late payments effortlessly.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate("home")}
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("pricing")}
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("dashboard")}
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Contact
            </h3>

            <div className="space-y-3">
              <a
                href="mailto:hello@paychase.com"
                className="flex items-center justify-center md:justify-start gap-2 text-sm hover:text-emerald-400 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>hello@paychase.com</span>
              </a>

              <div className="flex justify-center md:justify-start gap-4 pt-2">
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-sm text-center text-gray-400">
          © {currentYear} PayChase. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
