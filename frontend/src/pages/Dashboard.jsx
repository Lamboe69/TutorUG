import Navbar from "../components/Navbar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome to TutorUG. Your learning hub starts here.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-2">
              AI Tutor
            </h3>
            <p className="text-gray-600">
              Ask questions and get instant AI-powered explanations.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-2">
              Practice & Quizzes
            </h3>
            <p className="text-gray-600">
              Test your knowledge with smart quizzes.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-2">
              Study Groups
            </h3>
            <p className="text-gray-600">
              Discuss and learn together with peers.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
