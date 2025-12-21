import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Discussions() {
  const rooms = [
    { id: 1, name: "Mathematics (P7)" },
    { id: 2, name: "Physics (S4)" },
    { id: 3, name: "Biology (S6)" },
    { id: 4, name: "Computer Science (University)" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-extrabold mb-6">
          Discussion Rooms
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Link
              key={room.id}
              to={`/discussions/${room.id}`}
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition block"
            >
              <h3 className="text-xl font-semibold mb-2">
                {room.name}
              </h3>
              <p className="text-gray-600">
                Join discussions and ask questions.
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
