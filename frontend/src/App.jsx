import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="font-sans text-gray-900">

      {/* NAVBAR */}
      <Navbar />

      {/* ================= HERO SECTION ================= */}
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
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Get Started
          </button>

          <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-100 transition">
            Learn More
          </button>
        </div>
      </section>

      {/* ================= WHY TUTORUG ================= */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Why <span className="text-blue-600">TutorUG</span>?
        </h2>

        <p className="text-gray-600 mb-12">
          Everything you need to learn better, faster, and together.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white border rounded-xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-3">
              AI-Powered Learning
            </h3>
            <p className="text-gray-600">
              Personalized explanations, quizzes, and instant feedback powered by AI.
            </p>
          </div>

          <div className="bg-white border rounded-xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-3">
              Ugandan Curriculum
            </h3>
            <p className="text-gray-600">
              Fully aligned with Uganda’s education system — nursery to university.
            </p>
          </div>

          <div className="bg-white border rounded-xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-3">
              Learn Together
            </h3>
            <p className="text-gray-600">
              Connect with students and teachers through discussions and study groups.
            </p>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-gray-50 py-24 px-6 text-center">
        <h2 className="text-4xl font-bold mb-16">
          How It <span className="text-blue-600">Works</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-10 shadow-sm">
            <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-xl font-bold mb-2">
              Sign Up
            </h3>
            <p className="text-gray-600">
              Create an account and choose your education level.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-10 shadow-sm">
            <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-xl font-bold mb-2">
              Learn & Practice
            </h3>
            <p className="text-gray-600">
              Get AI-powered explanations, quizzes, and instant feedback.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-10 shadow-sm">
            <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-xl font-bold mb-2">
              Discuss & Grow
            </h3>
            <p className="text-gray-600">
              Join study groups and learn together with others.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-white text-center py-6">
        © 2025 TutorUG. All rights reserved.
      </footer>

    </div>
  );
}
