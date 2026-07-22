// /frontend/src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Leaf, ScanLine, Sparkles, Trophy, LayoutDashboard, Lightbulb,
  Menu, Recycle, LogOut, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "./GoogleSignInButton";
import { isAdminUser } from "../constants/admin";

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, authLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const isAdmin = isAdminUser(user);

  const userLinks = [
    { to: "/", label: "Home", icon: <Leaf size={16} /> },
    { to: "/scan", label: "Scan", icon: <ScanLine size={16} /> },
    { to: "/impact", label: "Impact", icon: <Sparkles size={16} /> },
    { to: "/leaderboard", label: "Leaderboard", icon: <Trophy size={16} /> },
  ];

  // Admin doesn't get Scan (that's a consumer action) or the floating
  // Assistant (handled separately in App.jsx) — just the internal tools.
  const adminLinks = [
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { to: "/insights", label: "Insights", icon: <Lightbulb size={16} /> },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  // Close the profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white/85 backdrop-blur-md shadow-sm border-b border-green-100/80 sticky top-0 z-40 transition-all duration-200">
      {/* 3-zone grid: logo | nav links | auth. On mobile, middle zone
          collapses and only logo + hamburger show. */}
      <div className="w-full px-6 md:px-10 py-3 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        {/* Left: brand */}
        <Link to={isAdmin ? "/dashboard" : "/"} className="flex items-center gap-2 text-green-700 font-bold text-lg sm:text-xl shrink-0">
          <Recycle className="text-green-500" size={24} />
          <span className="whitespace-nowrap">EcoView AI</span>
        </Link>

        {/* Center: desktop nav links */}
        <div className="hidden md:flex items-center justify-center gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors py-1 whitespace-nowrap
                ${pathname === l.to
                  ? "text-green-600 border-b-2 border-green-500"
                  : "text-gray-500 hover:text-green-600"
                }`}
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right: auth (desktop) + hamburger (mobile) */}
        <div className="flex items-center justify-end gap-3">
          {/* Desktop auth */}
          <div className="hidden md:block">
            {authLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center rounded-full hover:opacity-80 transition-opacity"
                  aria-label="Account menu"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className={`w-9 h-9 rounded-full ${isAdmin ? "ring-2 ring-amber-400" : ""}`}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold ${isAdmin ? "ring-2 ring-amber-400" : ""}`}>
                      {(user.displayName || user.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800 truncate flex items-center gap-1.5">
                        {user.displayName || "Signed in"}
                        {isAdmin && (
                          <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Admin</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <GoogleSignInButton />
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-500 hover:text-green-600 p-1.5"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-green-100 bg-white px-6 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 text-sm font-medium py-2.5 px-2 rounded-lg
                ${pathname === l.to ? "text-green-600 bg-green-50" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {l.icon}
              {l.label}
            </Link>
          ))}

          <div className="border-t border-gray-100 mt-2 pt-3">
            {authLoading ? (
              <div className="h-9 rounded-xl bg-gray-100 animate-pulse" />
            ) : user ? (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 min-w-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "User"} className="w-8 h-8 rounded-full shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold shrink-0">
                      {(user.displayName || user.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{user.displayName || "Signed in"}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setOpen(false); logout(); }}
                  className="text-gray-400 hover:text-red-500 p-2 shrink-0"
                  aria-label="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <GoogleSignInButton full />
            )}
          </div>
        </div>
      )}
    </nav>
  );
}