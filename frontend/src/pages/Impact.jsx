// /frontend/src/pages/Impact.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Sparkles, Leaf, Droplets, Trash2, ScanLine, IndianRupee,
  Award, Recycle, Cpu, Medal, Gem, Diamond, Lock,
  TrendingUp, BarChart3, Globe, Trees, Zap, Heart,
  ArrowRight, Circle, CheckCircle2, PartyPopper
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";
import useCountUp from "../hooks/useCountUp";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const DEVICE_COLORS = [
  "bg-gradient-to-r from-green-400 to-emerald-500",
  "bg-gradient-to-r from-blue-400 to-cyan-500",
  "bg-gradient-to-r from-purple-400 to-violet-500",
  "bg-gradient-to-r from-amber-400 to-orange-500",
  "bg-gradient-to-r from-pink-400 to-rose-500",
  "bg-gradient-to-r from-teal-400 to-green-500",
];

const TIERS = [
  { name: "Plastic", threshold: 0, icon: Recycle, color: "from-stone-300 to-stone-400", text: "text-stone-600", ring: "ring-stone-300", emoji: "♻️", description: "Every journey starts with a single step" },
  { name: "Copper", threshold: 2, icon: Cpu, color: "from-orange-400 to-orange-500", text: "text-orange-700", ring: "ring-orange-400", emoji: "🔶", description: "You're making real progress" },
  { name: "Silver", threshold: 5, icon: Medal, color: "from-slate-200 to-slate-400", text: "text-slate-600", ring: "ring-slate-300", emoji: "🥈", description: "Shining bright in the community" },
  { name: "Gold", threshold: 10, icon: Gem, color: "from-yellow-400 to-amber-500", text: "text-amber-700", ring: "ring-amber-400", emoji: "🏅", description: "You're a recycling champion" },
  { name: "Platinum", threshold: 20, icon: Diamond, color: "from-cyan-300 to-indigo-400", text: "text-indigo-700", ring: "ring-indigo-400", emoji: "💎", description: "Elite status achieved" },
];

function getTierProgress(scans) {
  let currentIndex = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (scans >= TIERS[i].threshold) { currentIndex = i; break; }
  }
  const nextIndex = currentIndex + 1 < TIERS.length ? currentIndex + 1 : null;
  const next = nextIndex !== null ? TIERS[nextIndex] : null;
  const span = next ? next.threshold - TIERS[currentIndex].threshold : 1;
  const progressPct = next ? Math.min(100, ((scans - TIERS[currentIndex].threshold) / span) * 100) : 100;
  return { currentIndex, nextIndex, next, progressPct, scansToNext: next ? next.threshold - scans : 0 };
}

function TierLadder({ scans }) {
  const { currentIndex, next, scansToNext } = getTierProgress(scans);
  const segmentPct = 100 / (TIERS.length - 1);
  const withinSegmentPct = next
    ? ((scans - TIERS[currentIndex].threshold) / (next.threshold - TIERS[currentIndex].threshold)) * segmentPct
    : 0;
  const overallPct = Math.min(100, currentIndex * segmentPct + withinSegmentPct);

  return (
    <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100/50 p-8">
      {/* Decorative background */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-green-400/5 to-emerald-400/5 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Award size={22} className="text-green-500" />
              Recovery Tier
            </h3>
            <p className="text-sm text-gray-400">Track your progress through the ranks</p>
          </div>
          {next ? (
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-sm font-medium text-green-700">
                {scansToNext} scans to <span className={`font-bold ${next.text}`}>{next.name}</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2 rounded-full border border-amber-200">
              <PartyPopper size={14} className="text-amber-500" />
              <span className="text-sm font-bold text-amber-700">Max tier reached!</span>
            </div>
          )}
        </div>

        <div className="relative px-4 mt-6">
          {/* Track background */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-6 h-2.5 bg-gray-100 rounded-full shadow-inner" />

          {/* Progress fill */}
          <div
            className="absolute left-8 top-1/2 -translate-y-6 h-2.5 rounded-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 transition-all duration-1000 shadow-lg shadow-green-500/20"
            style={{ width: `calc((100% - 4rem) * ${overallPct / 100})` }}
          />

          {/* Tier nodes */}
          <div className="relative flex items-start justify-between">
            {TIERS.map((tier, i) => {
              const Icon = tier.icon;
              const reached = i <= currentIndex;
              const isCurrent = i === currentIndex;
              const isNext = i === currentIndex + 1;

              return (
                <div key={tier.name} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                  <div className="relative flex items-center justify-center h-16">
                    <div
                      className={`rounded-full flex items-center justify-center transition-all duration-500
                        ${isCurrent ? 'w-14 h-14 ring-4 ring-offset-2 ring-offset-white' : 'w-11 h-11'}
                        ${isCurrent ? tier.ring : ''}
                        ${reached ? `bg-gradient-to-br ${tier.color} shadow-md` : 'bg-gray-100 border border-gray-200/50'}
                        ${isCurrent ? 'scale-110 shadow-lg' : ''}
                        ${isNext ? 'animate-pulse' : ''}
                        transition-transform duration-300 hover:scale-105`}
                    >
                      {reached ? (
                        <Icon size={isCurrent ? 24 : 18} className="text-white" strokeWidth={2.5} />
                      ) : (
                        <Lock size={16} className="text-gray-400" />
                      )}
                    </div>
                    {isCurrent && (
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                    )}
                  </div>
                  <span className={`text-xs font-semibold text-center ${isCurrent ? tier.text : reached ? 'text-gray-600' : 'text-gray-300'}`}>
                    {tier.name}
                  </span>
                  <span className="text-[10px] text-gray-400 text-center hidden sm:block">
                    {tier.threshold}+ scans
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievement description */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {TIERS[currentIndex].emoji} <span className="font-medium">{TIERS[currentIndex].name}</span> — {TIERS[currentIndex].description}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, decimals = 0, prefix = "", suffix = "", label, iconBg, iconColor, delay = 0, trend = null }) {
  const animated = useCountUp(value);

  return (
    <div
      className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-emerald-50/0 group-hover:from-green-50/30 group-hover:to-emerald-50/30 transition-all duration-500" />

      <div className="relative">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconBg} transition-transform group-hover:scale-110 duration-300`}>
          <div className={`${iconColor} transition-colors`}>{icon}</div>
        </div>

        <p className="text-3xl font-extrabold text-gray-800 tabular-nums">
          {prefix}{animated.toFixed(decimals)}{suffix}
        </p>
        <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>

        {trend && (
          <div className="flex items-center gap-1 mt-3">
            <span className={`text-xs font-semibold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-xs text-gray-400">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Impact() {
  const { user, authLoading, getIdToken } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImpact = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getIdToken();
      const { data } = await axios.get(`${API}/user/impact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load your impact.");
    } finally {
      setLoading(false);
    }
  }, [user, getIdToken]);

  useEffect(() => {
    if (!authLoading) fetchImpact();
  }, [authLoading, fetchImpact]);

  const deviceEntries = data ? Object.entries(data.device_breakdown || {}) : [];
  const maxDeviceCount = Math.max(1, ...deviceEntries.map(([, c]) => c));

  // Calculate total environmental impact in trees equivalent
  const treesEquivalent = data ? Math.round(data.total_carbon_saved_kg / 20) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header with animated stats */}


        {/* Sign in prompt */}
        {!authLoading && !user && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full">
                <Heart size={32} className="text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Track your impact</h3>
              <p className="text-gray-500 text-sm mt-1">Sign in to see your lifetime environmental impact</p>
            </div>
            <div className="flex justify-center">
              <GoogleSignInButton />
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {(authLoading || (user && loading)) && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 mb-4" />
                  <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            <div className="h-64 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
              <div className="w-32 h-6 bg-gray-200 rounded mb-6" />
              <div className="space-y-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-20 h-4 bg-gray-200 rounded" />
                    <div className="flex-1 h-3 bg-gray-200 rounded" />
                    <div className="w-8 h-4 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {user && !loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Data */}
        {user && !loading && !error && data && (
          <>
            {data.total_scans === 0 ? (
              <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100/50 p-16 text-center space-y-6">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                <div className="relative">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <ScanLine size={40} className="text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mt-4">No scans yet</h3>
                  <p className="text-gray-400 text-sm max-w-sm mx-auto">
                    Your impact journey starts with your first scan. Every device makes a difference!
                  </p>
                  <button
                    onClick={() => navigate("/scan")}
                    className="inline-flex items-center gap-2 px-6 py-3 mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all hover:shadow-xl hover:scale-[1.02]"
                  >
                    <ScanLine size={18} />
                    Scan your first device
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Tier Ladder */}
                <TierLadder scans={data.total_scans} />

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <StatCard
                    icon={<Leaf size={22} />}
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                    value={data.total_carbon_saved_kg}
                    decimals={1}
                    suffix=" kg"
                    label="CO₂ saved"
                    delay={0}
                    trend={5}
                  />
                  <StatCard
                    icon={<Droplets size={22} />}
                    iconBg="bg-blue-100"
                    iconColor="text-blue-600"
                    value={data.total_water_saved_liters}
                    decimals={1}
                    suffix=" L"
                    label="Water saved"
                    delay={100}
                    trend={3}
                  />
                  <StatCard
                    icon={<Trash2 size={22} />}
                    iconBg="bg-amber-100"
                    iconColor="text-amber-600"
                    value={data.total_landfill_reduction_kg}
                    decimals={1}
                    suffix=" kg"
                    label="Diverted from landfill"
                    delay={200}
                    trend={4}
                  />
                </div>

                {/* Secondary Stats */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <StatCard
                    icon={<ScanLine size={22} />}
                    iconBg="bg-gray-100"
                    iconColor="text-gray-600"
                    value={data.total_scans}
                    label="Devices scanned"
                    delay={300}
                  />
                  <StatCard
                    icon={<Award size={22} />}
                    iconBg="bg-emerald-100"
                    iconColor="text-emerald-600"
                    value={data.total_eco_points}
                    label="Total EcoPoints"
                    delay={400}
                  />
                  <StatCard
                    icon={<IndianRupee size={22} />}
                    iconBg="bg-teal-100"
                    iconColor="text-teal-600"
                    value={data.total_material_value_inr}
                    decimals={2}
                    prefix="₹"
                    label="Material value recovered"
                    delay={500}
                  />
                </div>

                {/* Device Breakdown */}
                {deviceEntries.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-8">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                          <BarChart3 size={22} className="text-green-500" />
                          Device Breakdown
                        </h3>
                        <p className="text-sm text-gray-400">Types of devices you've recycled</p>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                        <span className="text-xs font-medium text-gray-500">
                          {deviceEntries.length} types
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {deviceEntries.map(([type, count], i) => (
                        <div key={type} className="group">
                          <div className="flex items-center gap-4 mb-1.5">
                            <div className={`w-3 h-3 rounded-full ${DEVICE_COLORS[i % DEVICE_COLORS.length]}`} />
                            <span className="text-sm font-medium text-gray-700 flex-1">{type}</span>
                            <span className="text-sm font-bold text-gray-500">{count}</span>
                            <span className="text-xs text-gray-400 w-12 text-right">
                              {Math.round((count / data.total_scans) * 100)}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${DEVICE_COLORS[i % DEVICE_COLORS.length]} transition-all duration-1000 ease-out group-hover:scale-y-110`}
                              style={{ width: `${(count / maxDeviceCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Motivational footer */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-8 text-center text-white shadow-xl shadow-green-500/20">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Zap size={28} className="text-white/80" />
                    <h3 className="text-xl font-bold">Every scan counts</h3>
                    <Zap size={28} className="text-white/80" />
                  </div>
                  <p className="text-white/90 text-sm max-w-md mx-auto">
                    You've saved {data.total_carbon_saved_kg.toFixed(1)}kg of CO₂ — equivalent to planting {treesEquivalent} trees! 🌳
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}