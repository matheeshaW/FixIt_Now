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
    <nav className="p-4 bg-gray-800 text-white flex items-center justify-between">
      <div className="flex gap-4 items-center">
        <Link to="/">
          <img src="../images/logo.png" alt="logo" className="w-50 h-20" />
        </Link>
      </div>
      <div className="flex gap-4 items-center">
        {loggedIn && (
          <>
            {/* Profile button */}
            <Link to="/profile" className="hover:underline">
              Profile
            </Link>
            {role === "ADMIN" && (
              <Link to="/admin" className="hover:underline">
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 px-3 py-1 rounded"
            >
              Log out
            </button>
          </>
        )}
        {!loggedIn && (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}
