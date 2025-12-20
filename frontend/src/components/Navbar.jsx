export default function Navbar() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="text-2xl font-extrabold text-blue-600">
          TutorUG
        </div>

        {/* Nav Actions */}
        <div className="flex items-center gap-4">
          <button className="text-gray-700 font-medium hover:text-blue-600 transition">
            Login
          </button>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            Get Started
          </button>
        </div>

      </div>
    </nav>
  );
}
