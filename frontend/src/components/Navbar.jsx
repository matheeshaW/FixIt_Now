import { Link, useNavigate } from "react-router-dom";
import { getRole, isLoggedIn, logout } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const role = getRole();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      className={`shadow-md px-6 py-2 flex items-center justify-between bg-white ${
        role === "PROVIDER"
          ? "bg-gradient-to-r from-[#000000] to-[#475569]"
          : "bg-gradient-to-r from-[#AFCFD4] to-[#CDE3E7]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center">
          <img src="../images/logo.png" alt="logo" className="h-20 w-auto" />
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        {loggedIn ? (
          <>
            <Link
              to="/profile"
              className="text-white hover:text-gray-100 transition font-medium"
            >
              Profile
            </Link>
            {role === "ADMIN" && (
              <Link
                to="/admin"
                className="text-white hover:text-gray-100 transition font-medium"
              >
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow transition"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/register"
              className="bg-white text-green-700 font-medium px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="bg-green-500 text-white font-medium px-4 py-2 rounded-lg shadow hover:bg-green-600 transition"
            >
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
