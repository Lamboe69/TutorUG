import Button from "../components/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
          Learn Smarter with <span className="text-blue-600">TutorUG</span>
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          An AI-powered tutor built for Uganda’s curriculum — from nursery to university.
          Learn, discuss, and grow together.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </section>
    </div>
  );
}
