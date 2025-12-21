import Navbar from "../components/Navbar";

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold mb-2">
          Teacher Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Manage classes and support learners.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-2">Create Lessons</h3>
            <p className="text-gray-600">
              Upload notes and learning materials.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-2">Assignments</h3>
            <p className="text-gray-600">
              Assign and review student work.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-2">Student Progress</h3>
            <p className="text-gray-600">
              Track performance and engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
