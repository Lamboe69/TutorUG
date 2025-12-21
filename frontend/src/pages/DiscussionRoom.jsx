import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function DiscussionRoom() {
  const { id } = useParams();

  const threads = [
    { id: 1, title: "How do I solve quadratic equations?" },
    { id: 2, title: "Best way to revise for UNEB exams?" },
    { id: 3, title: "Explain Newton’s First Law simply" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-extrabold mb-6">
          Discussion Threads
        </h1>

        <div className="space-y-4">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              to={`/thread/${thread.id}`}
              className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition"
            >
              {thread.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
