import { Link, useLocation } from "react-router-dom";
import { getRole, isLoggedIn } from "../utils/auth";
import { useMemo } from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  const location = useLocation();

  const { loggedIn, role } = useMemo(() => {
    return { loggedIn: isLoggedIn(), role: getRole() };
  }, [location]);

  const isProvider = loggedIn && role === "PROVIDER";

  return (
    <footer
      className={`mt-0 text-white ${
        isProvider
          ? "bg-gradient-to-r from-[#000000] via-[#181d23] to-[#475569]"
          : "bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#0F172A]"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-10 grid gap-20 md:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src="../images/NavbarLogo.png"
              alt="FixIt Now"
              className="h-12 w-auto"
            />
          </div>
          {isProvider ? (
            <p className="text-sm text-gray-300">
              Manage your services, availability, and bookings with a
              professional toolkit designed for providers.
            </p>
          ) : (
            <p className="text-sm text-blue-100">
              Your trusted local service marketplace. Find providers, book
              services, and get things done.
            </p>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">
            Quick Links
          </h3>
          <ul className="space-y-2 text-blue-100">
            {isProvider ? (
              <>
                <li>
                  <Link to="/provider" className="hover:text-white transition">
                    Provider Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/provider" className="hover:text-white transition">
                    My Services
                  </Link>
                </li>
                <li>
                  <Link to="/provider" className="hover:text-white transition">
                    Create Service
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a href="/" className="hover:text-white transition">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/customer" className="hover:text-white transition">
                    Browse Services
                  </a>
                </li>
                {loggedIn && (
                  <li>
                    <Link to="/profile" className="hover:text-white transition">
                      My Account
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
        {/* Contact & Social */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">
            Contact
          </h3>
          <ul className="space-y-2 text-blue-100 mb-4">
            <li>Email: support@fixitnow.com</li>
            <li>Phone: +94 11 234 5678</li>
            <li>Hours: 9:00–18:00 (Mon–Fri)</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-blue-800/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-center text-sm text-blue-100">
          <p>© {year} FixIt Now. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
