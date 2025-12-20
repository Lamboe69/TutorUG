import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Landing() {
  return (
    <div className="font-sans text-gray-900">

      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-blue-50 py-24 text-center px-6">
        <h1 className="text-5xl font-extrabold mb-6">
          Learn Smarter with{" "}
          <span className="text-blue-600">TutorUG</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-gray-700 mb-10">
          An AI-powered tutor built for Uganda’s curriculum — from nursery to
          university. Learn, discuss, and grow together.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started
          </Link>

          <Link
            to="/login"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-100 transition"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white text-center py-6">
        © 2025 TutorUG. All rights reserved.
      </footer>
    </div>
  );
}
