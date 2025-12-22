import { Routes, Route } from "react-router-dom";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import Discussions from "./pages/Discussions";
import Thread from "./pages/Thread";

// Components / Routes
import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <>
      {/* Global Navbar */}
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/discussions"
          element={
            <ProtectedRoute>
              <Discussions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/discussions/:id"
          element={
            <ProtectedRoute>
              <Thread />
            </ProtectedRoute>
          }
        />

        <Route
          path="/thread/:id"
          element={
            <ProtectedRoute>
              <Thread />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  );
}
