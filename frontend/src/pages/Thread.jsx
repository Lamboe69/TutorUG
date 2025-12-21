import { useState } from "react";
import Navbar from "../components/Navbar";

export default function Thread() {
  const [comments, setComments] = useState([
    { user: "Student A", text: "I find factorization easiest." },
    { user: "Teacher", text: "Try completing the square as well." },
  ]);

  const [input, setInput] = useState("");

  const addComment = () => {
    if (!input.trim()) return;
    setComments([...comments, { user: "You", text: input }]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-extrabold mb-6">
          Thread Discussion
        </h1>

        <div className="space-y-4">
          {comments.map((c, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <p className="font-semibold">{c.user}</p>
              <p className="text-gray-700">{c.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t bg-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addComment}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
