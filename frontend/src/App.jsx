import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AITutor from "./pages/AITutor";
import Discussions from "./pages/Discussions";
import DiscussionRoom from "./pages/DiscussionRoom";
import Thread from "./pages/Thread";



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ai-tutor" element={<AITutor />} />
      <Route path="/discussions" element={<Discussions />} />
      <Route path="/discussions/:id" element={<DiscussionRoom />} />
      <Route path="/thread/:id" element={<Thread />} />

    </Routes>
  );
}
