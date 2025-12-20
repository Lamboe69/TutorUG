import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold text-blue-600">
          TutorUG
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-gray-700 font-medium hover:text-blue-600 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>

      </div>
    </nav>
  );
}
