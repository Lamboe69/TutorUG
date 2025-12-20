import Navbar from "../components/Navbar";

export default function Register() {
  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-20">
        <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">

          <h2 className="text-3xl font-extrabold text-center mb-6">
            Create Your Account
          </h2>

          <form className="space-y-5">

            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Your full name"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 0770123456"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Education Level
              </label>
              <select className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Primary</option>
                <option>Secondary</option>
                <option>University</option>
                <option>Teacher</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a password"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 font-semibold">
              Login
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}
