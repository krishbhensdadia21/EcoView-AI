// /frontend/src/pages/Leaderboard.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Trophy, Crown, Leaf, Sparkles, Medal, TrendingUp, Zap, Users, Star, Flame } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";
import useCountUp from "../hooks/useCountUp";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PODIUM_STYLE = {
  1: { 
    ring: "ring-yellow-400", 
    bg: "from-yellow-400 to-amber-500", 
    height: "h-48 sm:h-56", 
    crown: "text-yellow-400",
    glow: "shadow-[0_0_40px_rgba(250,204,21,0.3)]",
    label: "🥇 Gold"
  },
  2: { 
    ring: "ring-gray-300", 
    bg: "from-gray-300 to-gray-400", 
    height: "h-40 sm:h-44", 
    crown: "text-gray-400",
    glow: "shadow-[0_0_30px_rgba(156,163,175,0.2)]",
    label: "🥈 Silver"
  },
  3: { 
    ring: "ring-amber-600", 
    bg: "from-amber-600 to-amber-700", 
    height: "h-40 sm:h-44", 
    crown: "text-amber-600",
    glow: "shadow-[0_0_30px_rgba(180,83,9,0.2)]",
    label: "🥉 Bronze"
  },
};

function Avatar({ entry, size = 44, isPodium = false }) {
  return entry.photo_url ? (
    <img
      src={entry.photo_url}
      alt={entry.display_name}
      style={{ width: size, height: size }}
      className={`rounded-full object-cover ${isPodium ? 'ring-4 ring-white' : ''}`}
      referrerPolicy="no-referrer"
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white flex items-center justify-center font-bold text-lg ${isPodium ? 'ring-4 ring-white' : ''}`}
    >
      {entry.display_name?.[0]?.toUpperCase() || "U"}
    </div>
  );
}

function PodiumSlot({ entry, isYou }) {
  const style = PODIUM_STYLE[entry.rank];
  const points = useCountUp(entry.eco_points);
  
  return (
    <div className={`flex flex-col items-center justify-end ${style.height} relative`}>
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-full ${style.glow} opacity-50 blur-2xl`} />
      
      {/* Rank badge */}
      <div className="absolute -top-3 -right-3 z-10">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${style.bg} text-white text-xs font-bold flex items-center justify-center shadow-lg ring-2 ring-white`}>
          {entry.rank}
        </div>
      </div>
      
      {/* Avatar */}
      <div className={`relative rounded-full ring-4 ${style.ring} ${isYou ? "outline outline-3 outline-green-500 outline-offset-4" : ""} transition-transform hover:scale-105 duration-300`}>
        <Avatar entry={entry} size={entry.rank === 1 ? 72 : 56} isPodium />
      </div>
      
      {/* Name */}
      <p className="text-xs font-semibold text-gray-700 mt-3 max-w-[100px] truncate text-center">
        {entry.display_name}
        {isYou && <span className="text-green-600 ml-1">⭐</span>}
      </p>
      
      {/* Points with animated counter */}
      <p className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent tabular-nums">
        {points.toFixed(0)}
      </p>
      
      {/* Podium base */}
      <div className={`w-full mt-2 rounded-t-2xl bg-gradient-to-b ${style.bg} h-8 opacity-90`} />
      
      {/* Label */}
      <span className="text-[10px] font-medium text-gray-400 mt-1">{style.label}</span>
    </div>
  );
}

function TopPerformerBadge({ entry }) {
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1.5 rounded-full border border-amber-200">
      <Flame size={14} className="text-amber-500" />
      <span className="text-xs font-medium text-amber-700">Hot streak</span>
    </div>
  );
}

export default function Leaderboard() {
  const { user, authLoading, getIdToken } = useAuth();
  const [board, setBoard] = useState([]);
  const [yourRank, setYourRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredRank, setHoveredRank] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = {};
      if (user) {
        const token = await getIdToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      }
      const { data } = await axios.get(`${API}/leaderboard`, { headers });
      setBoard(data.leaderboard || []);
      setYourRank(data.your_rank ?? null);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load the leaderboard.");
    } finally {
      setLoading(false);
    }
  }, [user, getIdToken]);

  useEffect(() => {
    if (!authLoading) fetchLeaderboard();
  }, [authLoading, fetchLeaderboard]);

  const top3 = board.filter((e) => e.rank <= 3);
  const rest = board.filter((e) => e.rank > 3);
  const podiumOrder = [2, 1, 3].map((r) => top3.find((e) => e.rank === r)).filter(Boolean);
  
  // Calculate total participants
  const totalParticipants = board.length;

  return (
    <>
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-50/30">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header with stats */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100/50 p-8">
          {/* Decorative gradient orb */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-teal-400/10 to-cyan-400/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl shadow-lg">
                  <Trophy size={24} className="text-white" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-800">
                  Leaderboard
                </h1>
              </div>
              <p className="text-gray-500 text-sm flex items-center gap-2">
                <Users size={16} />
                {totalParticipants} champions competing
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <Sparkles size={16} className="text-green-500" />
                <span className="text-sm font-medium text-green-700">
                  Top 3 earn bonus points
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sign in prompt */}
        {!authLoading && !user && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full">
                <Medal size={24} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Join the competition</p>
                <p className="text-sm text-gray-500">Sign in to see your rank and appear on the leaderboard</p>
              </div>
            </div>
            <GoogleSignInButton />
          </div>
        )}

        {/* Your rank banner */}
        {user && !loading && yourRank && (
          <div className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg shadow-green-500/20 px-6 py-4">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <Trophy size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Your Current Rank</p>
                  <p className="text-2xl font-bold text-white">#{yourRank}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <TrendingUp size={16} className="text-white" />
                <span className="text-sm font-medium text-white">Keep scanning to climb!</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
                    <div className="h-2 w-20 bg-gray-200 rounded" />
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 text-center">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && board.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <Trophy size={40} className="text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700">No champions yet</h3>
            <p className="text-gray-400 text-sm">Be the first to scan and claim the crown! 👑</p>
          </div>
        )}

        {/* Podium */}
        {!loading && !error && podiumOrder.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 pt-10 px-4 sm:px-8 pb-6 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-400/5 rounded-full blur-3xl" />
            
            <div className="flex items-center justify-center gap-2 mb-6">
              <Zap size={18} className="text-yellow-500" />
              <span className="text-sm font-semibold text-gray-600">Podium</span>
              <Zap size={18} className="text-yellow-500" />
            </div>
            
            <div className="flex items-end justify-center gap-6 sm:gap-12">
              {podiumOrder.map((entry) => (
                <PodiumSlot key={entry.uid} entry={entry} isYou={user && entry.uid === user.uid} />
              ))}
            </div>
          </div>
        )}

        {/* Rest of the list with improved design */}
        {!loading && !error && rest.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
            {/* List header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
              <span className="col-span-2 sm:col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Rank</span>
              <span className="col-span-5 sm:col-span-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Champion</span>
              <span className="col-span-3 sm:col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center sm:text-left">Impact</span>
              <span className="col-span-2 sm:col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Points</span>
            </div>
            
            {rest.map((entry) => {
              const isYou = user && entry.uid === user.uid;
              const isHovered = hoveredRank === entry.rank;
              
              return (
                <div
                  key={entry.uid}
                  className={`group grid grid-cols-12 gap-4 items-center px-6 py-4.5 transition-all duration-300 border-b border-gray-50 last:border-0
                    ${isYou ? "bg-gradient-to-r from-green-50 to-emerald-50/50" : "hover:bg-gray-50/80"}
                    ${isHovered ? "scale-[1.01] shadow-sm bg-gray-50/30" : ""}`}
                  onMouseEnter={() => setHoveredRank(entry.rank)}
                  onMouseLeave={() => setHoveredRank(null)}
                >
                  {/* Rank */}
                  <div className="col-span-2 sm:col-span-1 text-center">
                    <span className={`text-sm font-bold ${entry.rank <= 10 ? 'text-amber-600' : 'text-gray-400'}`}>
                      #{entry.rank}
                    </span>
                  </div>
                  
                  {/* Avatar & Name */}
                  <div className="col-span-5 sm:col-span-6 min-w-0 flex items-center gap-3">
                    <Avatar entry={entry} size={40} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate flex items-center gap-2">
                        {entry.display_name}
                        {isYou && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md font-semibold border border-green-200 shrink-0">
                            <Star size={10} fill="currentColor" />
                            You
                          </span>
                        )}
                        {entry.rank <= 10 && !isYou && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-semibold border border-amber-200 shrink-0">
                            <Flame size={10} />
                            Top 10
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <ScanIcon size={10} />
                        {entry.scans} scan{entry.scans !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  
                  {/* Environmental impact */}
                  <div className="col-span-3 sm:col-span-3 flex items-center justify-center sm:justify-start">
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 rounded-full border border-green-100/50 text-xs text-gray-500 font-medium">
                      <Leaf size={12} className="text-green-500" />
                      <span className="text-green-700">{entry.carbon_saved_kg} kg CO₂</span>
                    </div>
                  </div>
                  
                  {/* Points with animated counter */}
                  <div className="col-span-2 sm:col-span-2 text-right">
                    <p className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500 text-base tabular-nums">
                      {useCountUp(entry.eco_points).toFixed(0)}
                    </p>
                    <p className="text-[10px] text-gray-400">EcoPoints</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
    </>
  );
}

// Helper component for scan icon
function ScanIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}