import Button from "../components/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================= HERO SECTION ================= */}
      <section className="max-w-6xl mx-auto px-6 py-28 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
          Learn Smarter with{" "}
          <span className="text-blue-600">TutorUG</span>
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          An AI-powered tutor built for Uganda’s curriculum — from nursery to
          university. Learn, discuss, and grow together.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900">
            Why <span className="text-blue-600">TutorUG</span>?
          </h2>

          <p className="mt-4 text-center text-slate-600 max-w-xl mx-auto">
            Everything you need to learn better, faster, and together.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "AI-Powered Learning",
                desc: "Get personalized explanations, practice questions, and instant feedback powered by AI.",
              },
              {
                title: "Ugandan Curriculum",
                desc: "Fully aligned with Uganda’s education system — from nursery to university.",
              },
              {
                title: "Learn Together",
                desc: "Connect with students and teachers through discussions, study groups, and shared learning.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="p-8 bg-slate-50 rounded-2xl border 
                           text-center transition 
                           hover:shadow-lg hover:-translate-y-1"
              >
                <h3 className="text-xl font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
