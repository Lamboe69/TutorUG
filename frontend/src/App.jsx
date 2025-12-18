import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Button from "./components/Button";
import Input from "./components/Input";
import Card from "./components/Card";
import Loader from "./components/Loader";

function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl font-semibold">TutorUG UI Kit</h1>

      <Card>
        <Input label="Phone Number" placeholder="07XXXXXXXX" />
        <div className="mt-4 flex gap-2">
          <Button>Continue</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </Card>

      <Loader />
    </div>
  );
}

export default App;

