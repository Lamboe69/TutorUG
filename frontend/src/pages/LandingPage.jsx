import Button from "../components/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-white py-20">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="text-3xl font-bold text-center text-slate-900">
      Why TutorUG?
    </h2>

    <div className="mt-12 grid md:grid-cols-3 gap-8">
      {[
        {
          title: "AI-Powered Learning",
          desc: "Get personalized explanations and practice powered by AI.",
        },
        {
          title: "Ugandan Curriculum",
          desc: "Aligned with Uganda’s education system from nursery to university.",
        },
        {
          title: "Learn Together",
          desc: "Connect with students and teachers through discussions and study groups.",
        },
      ].map((item, i) => (
        <div
          key={i}
          className="p-6 border rounded-xl text-center hover:shadow-md transition"
        >
          <h3 className="text-xl font-semibold">{item.title}</h3>
          <p className="mt-3 text-slate-600">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>

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
