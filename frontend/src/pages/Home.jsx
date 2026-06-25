import { Link } from "react-router-dom";
import { ScanLine, Recycle, BarChart3, Leaf } from "lucide-react";

const features = [
  {
    icon: <ScanLine className="text-green-500" size={32} />,
    title: "AI Device Detection",
    desc: "Upload a photo and our AI instantly identifies the device, estimates age, and scores its condition.",
  },
  {
    icon: <Recycle className="text-blue-500" size={32} />,
    title: "Smart Recommendation",
    desc: "Get personalised Reuse → Repair → Refurbish → Recycle guidance powered by LLaMA Vision.",
  },
  {
    icon: <Leaf className="text-emerald-500" size={32} />,
    title: "Carbon Savings",
    desc: "See exactly how much CO₂ and water you save by choosing the right disposal method.",
  },
  {
    icon: <BarChart3 className="text-purple-500" size={32} />,
    title: "Government Dashboard",
    desc: "Real-time e-waste hotspots, collection trends, and carbon metrics for policy makers.",
  },
];

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <section className="text-center mb-20">

        <h1 className="text-5xl font-extrabold text-gray-800 leading-tight mb-6">
          Scan. Decide. <span className="text-green-600">Save the Planet.</span>
        </h1>

        <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8">
          EcoView AI uses Groq-powered LLaMA Vision to analyse your e-waste,
          recommend the best action, and connect you with verified recyclers across India.
        </p>

        <Link
          to="/scan"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700
                     text-white font-semibold px-8 py-3 rounded-xl shadow-lg
                     transition-all duration-200 text-lg"
        >
          <ScanLine size={20} />
          Start Scanning
        </Link>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((f) => (
          <div key={f.title}
               className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100
                          hover:shadow-md transition-shadow">
            <div className="mb-3">{f.icon}</div>
            <h3 className="font-semibold text-gray-800 text-lg mb-1">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}