import { Link } from "react-router-dom";
import { isLoggedIn, clearSession } from "../utils/auth";

export default function Navbar() {
  const loggedIn = isLoggedIn();

  const handleLogout = () => {
    clearSession();
    window.location.href = "/";
  };

  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

        <Link to="/" className="text-2xl font-extrabold text-blue-600">
          TutorUG
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          {!loggedIn ? (
            <>
              <Link
                to="/login"
                className="text-sm sm:text-base text-gray-700 font-medium hover:text-blue-600 transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="text-sm sm:text-base text-gray-700 font-medium hover:text-blue-600 transition"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
