import React, { Component } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Scan from "./pages/Scan";
import Results from "./pages/Results";
import GovDashboard from "./pages/GovDashboard";
import Insights from "./pages/Insights";  // NEW
import Assistant from "./pages/Assistant"; // NEW
import Impact from "./pages/Impact";
import Leaderboard from "./pages/Leaderboard";
import FloatingAssistant from "./components/FloatingAssistant";
import { useAuth } from "./context/AuthContext";
import { isAdminUser } from "./constants/admin";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto my-12 p-8 bg-red-50 text-red-800 rounded-2xl border border-red-200 shadow-xl">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            ⚠️ Application Render Error
          </h2>
          <p className="text-sm font-medium mb-2">The interface encountered an unexpected error:</p>
          <pre className="text-xs font-mono bg-white p-4 rounded-xl border border-red-100 overflow-auto max-h-60 mb-4 whitespace-pre-wrap">
            {this.state.error?.stack || this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-500/20 transition-all"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { user, authLoading } = useAuth();
  const isAdmin = isAdminUser(user);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-green-700">Loading EcoView AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background gradient container */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50/30 -z-20 pointer-events-none" />

      {/* Fixed background image overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-bottom opacity-[0.20] pointer-events-none -z-10" 
        style={{ backgroundImage: "url('/misty_forest_bg.png')" }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Toaster position="top-right" />
        
        <ErrorBoundary>
          <Navbar />
          
          <Routes>
            <Route path="/" element={isAdmin ? <Navigate to="/dashboard" replace /> : <Home />} />
            {/* Scan is a consumer feature — admin gets redirected to dashboard even on direct URL */}
            <Route path="/scan" element={isAdmin ? <Navigate to="/dashboard" replace /> : <Scan />} />
            <Route path="/results" element={<Results />} />
            <Route path="/dashboard" element={isAdmin ? <GovDashboard /> : <Navigate to="/" replace />} />
            <Route path="/insights" element={isAdmin ? <Insights /> : <Navigate to="/" replace />} />      {/* NEW */}
            <Route path="/assistant" element={<Assistant />} />   {/* NEW */}
            <Route path="/impact" element={<Impact />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </ErrorBoundary>

        {/* Floating chatbot — visible for regular users only, not admin */}
        {!isAdmin && <FloatingAssistant />}
      </div>
    </div>
  );
}