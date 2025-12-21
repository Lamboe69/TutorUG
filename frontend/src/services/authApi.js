// Change this when backend is live
const API_BASE_URL = "http://localhost:8000/api"; // placeholder

// MOCK MODE (true = no backend required)
const MOCK_MODE = true;

export async function login({ phone, password }) {
  if (MOCK_MODE) {
    // simulate server delay
    await new Promise((r) => setTimeout(r, 800));
    return {
      success: true,
      role: "student", // or "teacher"
      token: "mock-jwt-token",
    };
  }

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });

  if (!res.ok) throw new Error("Invalid credentials");
  return res.json();
}

export async function register({ name, phone, password, level }) {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 900));
    return {
      success: true,
      role: level === "teacher" ? "teacher" : "student",
      token: "mock-jwt-token",
    };
  }

  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, password, level }),
  });

  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}
