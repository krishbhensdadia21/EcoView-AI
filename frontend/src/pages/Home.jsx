import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
/* ─── Font Awesome CDN ─── */
const FaIcon = ({ icon, className = "w-5 h-5" }) => (
  <i className={`fa-solid fa-${icon} ${className}`}></i>
);
/* ─── tiny scroll-reveal hook ─── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: options.threshold ?? 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}
/* ─── data ─── */
const features = [
  {
    icon: "microchip",
    title: "AI-Powered Vision",
    desc: "Groq's LLaMA Vision analyses your device in seconds, detecting model, condition, and potential faults.",
    color: "from-violet-500 to-purple-600"
  },
  {
    icon: "coins",
    title: "Accurate Valuations",
    desc: "Get real-time material value estimates for copper, gold, aluminium, and rare earth elements.",
    color: "from-amber-500 to-orange-600"
  },
  {
    icon: "handshake",
    title: "Verified Partners",
    desc: "Connect with trusted recyclers, repair shops, and NGOs across India, all pre-vetted.",
    color: "from-blue-500 to-indigo-600"
  },
  {
    icon: "chart-line",
    title: "Track & Impact",
    desc: "Monitor your e-waste journey and see the environmental impact you're making in real-time.",
    color: "from-emerald-500 to-green-600"
  },
];
const steps = [
  { icon: "camera", title: "Snap a photo", desc: "Upload an image and describe the problem, if there is one.", color: "from-green-400 to-emerald-500" },
  { icon: "brain", title: "AI inspects it", desc: "Vision model identifies the device and reads visible damage.", color: "from-emerald-400 to-teal-500" },
  { icon: "clipboard-check", title: "Get your verdict", desc: "Reuse, Repair, Refurbish or Recycle — with the numbers behind it.", color: "from-teal-400 to-cyan-500" },
  { icon: "location-dot", title: "Take action", desc: "Connect with a verified partner near you, in one tap.", color: "from-cyan-400 to-blue-500" },
];
const beforeItems = [
  '"I think it\'s broken, so I\'ll just throw it out."',
  "No idea what the copper, gold, or aluminium inside is worth.",
  "Toxic materials end up in landfill instead of a recycler.",
  "A repairable device gets recycled for a fraction of its worth.",
];
const afterItems = [
  "AI diagnoses the likely fault before you decide anything.",
  "Exact recoverable material value, down to the rupee.",
  "Routed to the right verified partner — repair, NGO, or recycler.",
  "A passport that tracks the device's condition over time.",
];
const CALC_DEVICES = {
  Laptop: { carbon: 250, water: 1200, value: 3500 },
  Mobile: { carbon: 70, water: 800, value: 2000 },
  Desktop: { carbon: 400, water: 1500, value: 4500 },
  Monitor: { carbon: 150, water: 600, value: 1200 },
  Keyboard: { carbon: 20, water: 100, value: 150 },
};
/* ─── component ─── */
export default function Home() {
  const [featuresRef, featuresIn] = useInView();
  const [baRef, baIn] = useInView();
  const [stepsRef, stepsIn] = useInView();
  const [calcDevice, setCalcDevice] = useState("Laptop");
  const [calcQty, setCalcQty] = useState(3);
  const [calcStatus, setCalcStatus] = useState("Functional");
  const deviceStats = CALC_DEVICES[calcDevice] || CALC_DEVICES.Laptop;
  const carbonMultiplier = calcStatus === "Functional" ? 1.0 : 0.4;
  const valueMultiplier = calcStatus === "Functional" ? 1.0 : 0.25;
  const calculatedCarbon = deviceStats.carbon * carbonMultiplier * calcQty;
  const calculatedWater = deviceStats.water * carbonMultiplier * calcQty;
  const calculatedValue = deviceStats.value * valueMultiplier * calcQty;
  return (
    <>
      {/* ── Font Awesome ── */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      {/* ── keyframes ── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes heroFade {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .anim-fade-up {
          opacity: 0;
          animation: fadeUp 0.55s ease-out forwards;
        }
        .anim-scale-in {
          opacity: 0;
          animation: scaleIn 0.45s ease-out forwards;
        }
        .anim-hero {
          opacity: 0;
          animation: heroFade 0.6s ease-out forwards;
        }
        .icon-pulse {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .fa-icon {
          font-size: 1.25rem;
        }
        .fa-icon-lg {
          font-size: 1.5rem;
        }
      `}</style>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 overflow-hidden">
        {/* ═══════════════ HERO ═══════════════ */}
        <section className="min-h-[75vh] flex flex-col justify-center items-center text-center relative pt-20 sm:pt-28 pb-8 sm:pb-12 mb-6 overflow-hidden">


          <h1 className="anim-hero text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900
                         leading-[1.1] mb-6 tracking-tight"
            style={{ animationDelay: "0.15s" }}>
            Scan. Decide.{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              Save the Planet.
            </span>
          </h1>

          <p className="anim-hero text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto mb-10
                        leading-relaxed"
            style={{ animationDelay: "0.25s" }}>
            EcoView AI is an intelligent platform that simplifies e-waste management using AI, helping users identify devices, evaluate their condition, and make sustainable disposal decisions.
          </p>

          <div className="anim-hero flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ animationDelay: "0.35s" }}>
            <Link
              to="/scan"
              className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-green-600
                         to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white
                         font-semibold px-8 py-3.5 rounded-2xl shadow-lg shadow-green-600/25
                         transition-all duration-300 text-lg hover:shadow-xl hover:shadow-green-600/30
                         hover:-translate-y-0.5 active:translate-y-0"
            >
              <i className="fa-solid fa-camera text-white"></i>
              Start Scanning
              <i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
            </Link>
          </div>
        </section>
        {/* ═══════════════ FEATURES ═══════════════ */}
        <section ref={featuresRef} className="py-24">
          <div className={featuresIn ? "anim-fade-up" : "opacity-0"} style={{ animationDelay: "0s" }}>
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700
                               bg-green-50 px-3 py-1 rounded-full mb-4 border border-green-200/60">
                Why EcoView AI
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                Built for a{" "}
                <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                  sustainable future
                </span>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={f.title}
                className={featuresIn ? "anim-scale-in" : "opacity-0"}
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="group relative bg-white/80 backdrop-blur rounded-2xl border border-gray-100
                                shadow-sm hover:shadow-xl p-6 text-center transition-all duration-300
                                hover:border-green-200 hover:-translate-y-2 cursor-default h-full
                                overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0
                                  group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: f.color }} />
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color}
                                  text-white flex items-center justify-center mx-auto mb-4
                                  shadow-lg group-hover:scale-110 transition-transform duration-300
                                  shadow-${f.color.split('-')[1]}-600/20`}>
                    <i className={`fa-solid fa-${f.icon} text-2xl`}></i>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* ═══════════════ INTERACTIVE IMPACT CALCULATOR ═══════════════ */}
        <section className="py-16 bg-white/40 backdrop-blur-md border border-green-100/50 rounded-3xl p-8 sm:p-10 mb-12 shadow-sm">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700
                             bg-green-50 px-3 py-1 rounded-full mb-3 border border-green-200/50">
              Interactive Impact Calculator
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              Estimate your <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">Eco Impact</span>
            </h2>
            <p className="text-gray-500 text-sm mt-2 max-w-lg mx-auto">
              Select a device type, input details, and instantly see the potential CO₂ emissions, water, and material recovery value you can save.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Controls - 7 Cols */}
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
              {/* Device Tabs */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Select Device Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {Object.keys(CALC_DEVICES).map((d) => {
                    const isActive = calcDevice === d;
                    const iconMap = {
                      Laptop: "laptop",
                      Mobile: "mobile-screen-button",
                      Desktop: "desktop",
                      Monitor: "display",
                      Keyboard: "keyboard",
                    };
                    return (
                      <button
                        key={d}
                        onClick={() => setCalcDevice(d)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                          ${isActive
                            ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-600/10 scale-105"
                            : "bg-white text-gray-600 border-gray-100 hover:bg-green-50/50 hover:border-green-200"}`}
                      >
                        <i className={`fa-solid fa-${iconMap[d]} text-lg mb-1.5`}></i>
                        <span className="text-xs font-semibold">{d}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Quantity Slider */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700">Quantity</label>
                  <span className="text-lg font-bold text-green-600 bg-green-50 px-3 py-0.5 rounded-full border border-green-200/50">
                    {calcQty} {calcQty === 1 ? "device" : "devices"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={calcQty}
                  onChange={(e) => setCalcQty(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 px-1 font-medium">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
              {/* Condition Toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Device Condition / Disposal Intent
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setCalcStatus("Functional")}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200
                      ${calcStatus === "Functional"
                        ? "bg-emerald-50/80 border-emerald-500 shadow-sm"
                        : "bg-white border-gray-100 hover:bg-gray-50"}`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0
                      ${calcStatus === "Functional"
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-gray-300"}`}>
                      {calcStatus === "Functional" && <i className="fa-solid fa-check text-[10px]"></i>}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Working / Repairable</p>
                      <p className="text-xs text-gray-500 mt-0.5">Disposal for Reuse/Refurbish</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setCalcStatus("Broken")}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200
                      ${calcStatus === "Broken"
                        ? "bg-red-50/80 border-red-300 shadow-sm"
                        : "bg-white border-gray-100 hover:bg-gray-50"}`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0
                      ${calcStatus === "Broken"
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-gray-300"}`}>
                      {calcStatus === "Broken" && <i className="fa-solid fa-check text-[10px]"></i>}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Dead / Non-functional</p>
                      <p className="text-xs text-gray-500 mt-0.5">Disposal for Recycler</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            {/* Right Metrics - 5 Cols */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-green-700 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-green-950/20 flex flex-col justify-between h-full relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
                <div className="relative space-y-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-200/80">Estimated Savings Summary</p>
                  <div className="space-y-4">
                    {/* Carbon Saved */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <i className="fa-solid fa-cloud text-green-200 text-lg"></i>
                        </div>
                        <div>
                          <p className="text-xs text-green-200/85">Avoided Carbon</p>
                          <p className="text-sm text-gray-400 font-medium leading-none">Avoided CO₂ emissions</p>
                        </div>
                      </div>
                      <p className="text-2xl font-extrabold tracking-tight">
                        {Math.round(calculatedCarbon)} kg
                      </p>
                    </div>
                    {/* Water Saved */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <i className="fa-solid fa-droplet text-green-200 text-lg"></i>
                        </div>
                        <div>
                          <p className="text-xs text-green-200/85">Water Conserved</p>
                          <p className="text-sm text-gray-400 font-medium leading-none">Avoiding manufacturing</p>
                        </div>
                      </div>
                      <p className="text-2xl font-extrabold tracking-tight">
                        {Math.round(calculatedWater).toLocaleString()} L
                      </p>
                    </div>
                    {/* Value Recovered */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <i className="fa-solid fa-indian-rupee-sign text-green-200 text-lg"></i>
                        </div>
                        <div>
                          <p className="text-xs text-green-200/85">Estimated Value</p>
                          <p className="text-sm text-gray-400 font-medium leading-none">Recoverable value</p>
                        </div>
                      </div>
                      <p className="text-2xl font-extrabold tracking-tight">
                        ₹ {Math.round(calculatedValue).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Verdict Badge */}
                <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                  <div className={`p-4 rounded-2xl text-center backdrop-blur-md border ${calcStatus === "Functional"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                    : "bg-red-500/10 border-red-500/20 text-red-200"
                    }`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-85 mb-1">Recommended Pathway</p>
                    <p className="text-base font-bold">
                      {calcStatus === "Functional" ? "♻️ Reuse / Refurbish First" : "⚡ Recycle Responsibly"}
                    </p>
                    <p className="text-[11px] opacity-80 mt-1 leading-normal">
                      {calcStatus === "Functional"
                        ? "Disposing for reuse maximizes carbon savings by 2.5x compared to recycling."
                        : "Ensure materials are safely extracted by pre-vetted recyclers."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ═══════════════ BEFORE / AFTER ═══════════════ */}
        <section ref={baRef} className="py-24">
          <div className={baIn ? "anim-fade-up" : "opacity-0"} style={{ animationDelay: "0s" }}>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700
                               bg-amber-50 px-3 py-1 rounded-full mb-4 border border-amber-200/60">
                The real difference
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                You already have an old device.{" "}
                <span className="text-green-600">Here's what changes.</span>
              </h2>

            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Before */}
            <div className={baIn ? "anim-fade-up" : "opacity-0"} style={{ animationDelay: "0.1s" }}>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 relative
                              overflow-hidden hover:shadow-md transition-shadow duration-300 h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full
                                -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center">
                    <i className="fa-solid fa-xmark text-lg"></i>
                  </div>
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Without EcoView
                  </p>
                </div>
                <ul className="space-y-4">
                  {beforeItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-500 leading-relaxed">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* After */}
            <div className={baIn ? "anim-fade-up" : "opacity-0"} style={{ animationDelay: "0.2s" }}>
              <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700
                              rounded-3xl shadow-lg shadow-green-600/15 p-8 text-white relative
                              overflow-hidden hover:shadow-xl hover:shadow-green-600/20
                              transition-shadow duration-300 h-full">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full
                                -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full
                                translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-white/15 text-green-100 flex items-center justify-center">
                    <i className="fa-solid fa-check text-lg"></i>
                  </div>
                  <p className="text-sm font-semibold text-green-100/80 uppercase tracking-wider">
                    With EcoView
                  </p>
                </div>
                <ul className="space-y-4">
                  {afterItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-green-50 leading-relaxed">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-green-100 shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <section ref={stepsRef} className="py-24">
          <div className={stepsIn ? "anim-fade-up" : "opacity-0"} style={{ animationDelay: "0s" }}>
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700
                               bg-green-50 px-3 py-1 rounded-full mb-4 border border-green-200/60">
                Simple 4-step flow
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                How it works
              </h2>
            </div>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-0.5
                            bg-gradient-to-r from-green-200 via-emerald-200 to-cyan-200 rounded-full" />
            <div className="lg:hidden absolute top-0 bottom-0 left-[23px] w-0.5
                            bg-gradient-to-b from-green-200 via-emerald-200 to-cyan-200 rounded-full" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6">
              {steps.map((s, i) => (
                <div key={s.title}
                  className={stepsIn ? "anim-fade-up" : "opacity-0"}
                  style={{ animationDelay: `${i * 0.12 + 0.1}s` }}>
                  <div className="relative flex lg:flex-col items-start lg:items-center gap-5
                                  lg:gap-0 lg:text-center group">
                    <div className="relative z-10 shrink-0 lg:mb-5">
                      <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${s.color}
                                      text-white flex items-center justify-center shadow-lg
                                      shadow-green-600/15 group-hover:scale-110 transition-transform
                                      duration-300`}>
                        <i className={`fa-solid fa-${s.icon} text-xl lg:text-2xl`}></i>
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white
                                       border-2 border-gray-100 text-[10px] font-bold text-gray-500
                                       flex items-center justify-center shadow-sm">
                        {i + 1}
                      </span>
                    </div>
                    <div className="lg:px-1">
                      <h3 className="font-bold text-gray-900 mb-1.5 text-base">{s.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                    </div>
                    {i < steps.length - 1 && (
                      <i className="fa-solid fa-chevron-right hidden lg:block absolute top-[18px] -right-3 text-gray-300"></i>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}