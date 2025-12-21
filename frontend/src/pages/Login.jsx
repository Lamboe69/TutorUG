import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { login } from "../services/authApi";
import { setSession } from "../utils/auth";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    if (!phone || !password) {
      setError("Please enter both phone number and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await login({ phone, password });

      setSession({ token: res.token, role: res.role });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">

          <h2 className="text-3xl font-extrabold text-center mb-6">
            Welcome Back
          </h2>

          <div className="space-y-5">

            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center">
                {error}
              </p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </div>

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
