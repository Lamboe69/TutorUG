import Navbar from "../components/Navbar";

export default function Login() {
  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-20">
        <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">

          <h2 className="text-3xl font-extrabold text-center mb-6">
            Welcome Back
          </h2>

          <form className="space-y-5">

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
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-600 font-semibold">
              Sign up
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}
