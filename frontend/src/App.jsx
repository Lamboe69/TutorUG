import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Button from "./components/Button";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-4 items-center justify-center">
      <h1 className="text-2xl font-semibold text-slate-800">
        TutorUG Frontend Ready 🚀
      </h1>

      <div className="flex gap-3">
        <Button>Get Started</Button>
        <Button variant="secondary">Login</Button>
        <Button variant="outline">Learn More</Button>
      </div>
    </div>
  );
}

export default App;

