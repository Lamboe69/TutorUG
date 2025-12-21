import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl font-extrabold">
            Student Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Learn, practice, and grow with TutorUG.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

          {/* AI Tutor */}
          <Link
            to="/ai-tutor"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition block"
          >
            <h3 className="text-xl font-semibold mb-2">
              AI Tutor
            </h3>
            <p className="text-gray-600">
              Ask questions and get instant AI-powered explanations.
            </p>
          </Link>

          {/* Practice & Quizzes (Coming Soon) */}
          <div className="bg-white rounded-xl shadow p-6 opacity-90">
            <h3 className="text-xl font-semibold mb-2">
              Practice & Quizzes
            </h3>
            <p className="text-gray-600">
              Test your understanding with smart quizzes.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Coming soon
            </p>
          </div>

          {/* Study Groups / Discussions */}
          <Link
            to="/discussions"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition block"
          >
            <h3 className="text-xl font-semibold mb-2">
              Study Groups
            </h3>
            <p className="text-gray-600">
              Collaborate and discuss with fellow learners.
            </p>
          </Link>

        </div>
      </div>
    </div>
  );
}
