// /frontend/src/pages/Scan.jsx
import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { UploadCloud, MapPin, Loader2, AlertCircle, ScanLine, ChevronDown, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Scan() {
  const navigate = useNavigate();
  const { user, getIdToken } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [problem, setProblem] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Free-scan quota for anonymous users. `null` while unknown/loading,
  // `Infinity`-like `unlimited: true` once signed in.
  const [quota, setQuota] = useState(null);

  const fetchQuota = useCallback(async () => {
    try {
      const headers = {};
      if (user) {
        const token = await getIdToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      }
      const { data } = await axios.get(`${API}/scan/quota`, { headers });
      setQuota(data);
    } catch {
      // Non-critical — if this fails we just don't show the banner;
      // the backend still enforces the real limit on /scan/analyze.
      setQuota(null);
    }
  }, [user, getIdToken]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const limitReached = !user && quota && !quota.unlimited && quota.remaining <= 0;

  const problemSuggestions = [
    "Battery not charging",
    "Cracked screen",
    "Device won't turn on",
    "Overheating",
    "Slow performance",
    "Water damage",
    "Broken charging port",
    "Keyboard not working"
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
  });

  const handleScan = async () => {
    if (!file) {
      toast.error("Please upload an image first.");
      return;
    }

    if (!problem.trim()) {
      toast.error("Please describe the problem with your device.");
      return;
    }

    if (limitReached) {
      toast.error("Free scan limit reached. Sign in with Google to continue.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("problem", problem);
    formData.append("location", location || "India");

    try {
      const headers = { "Content-Type": "multipart/form-data" };
      if (user) {
        const token = await getIdToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      const { data } = await axios.post(`${API}/scan/analyze`, formData, { headers });
      sessionStorage.setItem("scanResult", JSON.stringify(data));

      // Keep the quota banner accurate for the next visit to this page
      if (!user && typeof data.scans_remaining === "number") {
        setQuota((q) => ({ ...(q || {}), authenticated: false, unlimited: false, remaining: data.scans_remaining }));
      }

      navigate("/results");
    } catch (err) {
      if (err?.response?.status === 403) {
        toast.error(err.response.data?.detail || "Free scan limit reached. Please sign in.");
        setQuota((q) => ({ ...(q || {}), authenticated: false, unlimited: false, remaining: 0 }));
      } else {
        toast.error(err?.response?.data?.detail || "Analysis failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setProblem(suggestion);
    setIsDropdownOpen(false);
  };
  return (
    <>
      <style>{`
        @keyframes scanner {
          0% { transform: translateY(0); }
          50% { transform: translateY(220px); }
          100% { transform: translateY(0); }
        }
        .animate-scanner-line {
          animation: scanner 3s ease-in-out infinite;
        }
      `}</style>

      <main className="max-w-2xl mx-auto px-6 sm:px-8 py-10 bg-white/80 backdrop-blur-md rounded-3xl border border-green-100/50 shadow-sm mt-8 mb-12">
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100/60 px-3 py-1 rounded-full border border-green-200/50">
            <ScanLine size={13} className="text-green-600" /> E-Waste AI Diagnostics
          </span>
        </div>

        <h2 className="text-3xl font-bold mb-4">
          <span className="text-gray-800">Scan </span>
          <span className="text-green-600">Your Device</span>
        </h2>

        {/* Free-scan quota banner (anonymous users only) */}
        {!user && quota && !quota.unlimited && (
          <div
            className={`flex items-center justify-between gap-3 flex-wrap rounded-2xl px-4 py-3.5 mb-6 border text-sm shadow-sm
              ${limitReached
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
              }`}
          >
            <div className="flex items-center gap-2 font-medium">
              <Lock size={16} className="shrink-0" />
              {limitReached
                ? "You've used all 5 free scans. Sign in with Google for unlimited scans."
                : `${quota.remaining} of ${quota.limit} free scans left. Sign in with Google for unlimited scans.`}
            </div>
            <GoogleSignInButton className="!py-1.5 !px-3 shrink-0" />
          </div>
        )}

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
                      transition-all duration-300 mb-6 relative overflow-hidden
                      ${isDragActive
              ? "border-green-500 bg-green-50/50 scale-[1.01]"
              : "border-gray-200 hover:border-green-400 hover:bg-green-50/10 bg-white"
            }`}
        >
          <input {...getInputProps()} />

          {preview ? (
            <div className="relative mx-auto max-h-56 max-w-sm rounded-xl overflow-hidden shadow-inner flex items-center justify-center bg-gray-50 border border-gray-100">
              <img src={preview} alt="Preview"
                className="max-h-56 object-contain rounded-xl" />

              {/* Laser scan line overlay */}
              {loading && (
                <>
                  <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_12px_#4ade80] pointer-events-none animate-scanner-line" />
                </>
              )}
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="text-green-500" size={26} />
              </div>
              <p className="text-gray-600 font-semibold text-sm">
                {isDragActive
                  ? "Drop it here…"
                  : "Drag & drop an image, or click to browse"}
              </p>
              <p className="text-xs text-gray-400 mt-1.5">JPEG · PNG · WEBP · max 10 MB</p>
            </>
          )}
        </div>

        {/* Problem Description - With Dropdown */}
        <div className="mb-6" ref={dropdownRef}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            What's the problem with your device?
            <span className="text-red-500 ml-1">*</span>
          </label>

          {/* Dropdown input */}
          <div className="relative">
            <div
              className="flex items-center gap-2 bg-white border border-gray-200
                         rounded-xl px-4 py-3 cursor-pointer hover:border-gray-400
                         transition-colors duration-200 shadow-sm"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <AlertCircle className="text-green-500 shrink-0" size={18} />
              <input
                type="text"
                placeholder="Select or type a problem..."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 outline-none focus:outline-none text-sm text-gray-700 bg-transparent"
              />
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''
                  }`}
              />
            </div>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 
                              rounded-xl shadow-lg max-h-60 overflow-y-auto py-1">
                {problemSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 
                               hover:bg-green-50 hover:text-green-700 transition-colors
                               flex items-center gap-2"
                  >
                    <AlertCircle size={14} className="text-gray-400 shrink-0" />
                    {suggestion}
                  </button>
                ))}
                <div className="border-t border-gray-100 my-1"></div>
                <div className="px-4 py-2.5 text-xs text-gray-400 flex items-center gap-2">
                  <span>✏️</span>
                  <span>Type your own problem above</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location - With label and no asterisk */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Location
          </label>
          <div className="flex items-center gap-2 bg-white border border-gray-200
                          rounded-xl px-4 py-3 shadow-sm">
            <MapPin className="text-green-500 shrink-0" size={18} />
            <input
              type="text"
              placeholder="Your city (e.g. Mumbai, Delhi)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 outline-none focus:outline-none text-sm text-gray-700 bg-transparent"
            />
          </div>
        </div>

        {file && !problem.trim() && (
          <div className="flex items-center gap-2 text-amber-600 text-sm mb-4 bg-amber-50 border border-amber-100 px-4 py-2.5 rounded-xl">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium">Please describe the problem to get accurate analysis</span>
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={loading || !file || !problem.trim() || limitReached}
          className="w-full flex items-center justify-center gap-2
                     bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:hover:translate-y-0
                     text-white font-semibold py-3.5 rounded-xl shadow-md shadow-green-600/10
                     hover:shadow-lg hover:-translate-y-0.5
                     transition-all duration-200 text-base"
        >
          {loading
            ? <><Loader2 className="animate-spin" size={20} /> Analysing…</>
            : limitReached
              ? <><Lock size={18} /> Sign in to continue scanning</>
              : "Analyse Device"}
        </button>
      </main>
    </>
  );
}