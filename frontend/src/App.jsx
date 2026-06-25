import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Scan from "./pages/Scan";
import Results from "./pages/Results";
import GovDashboard from "./pages/GovDashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Toaster position="top-right" />
      <Navbar />

      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/scan"      element={<Scan />} />
        <Route path="/results"   element={<Results />} />
        <Route path="/dashboard" element={<GovDashboard />} />
      </Routes>
    </div>
  );
}