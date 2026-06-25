import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { BarChart3, Leaf, IndianRupee, MapPin } from "lucide-react";

ChartJS.register(ArcElement, CategoryScale, LinearScale,
                 BarElement, Tooltip, Legend);

const API = "http://localhost:8000";

// Tailwind stat card
function StatCard({ icon, label, value, sub, colour }) {
  return (
    <div className={`rounded-2xl p-5 border ${colour}`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <p className="text-sm font-medium text-gray-600">{label}</p>
      </div>
      <p className="text-3xl font-extrabold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function GovDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${API}/dashboard/stats`)
      .then(({ data }) => setStats(data))
      .catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading dashboard…
      </div>
    );
  }

  // ── Chart data ───────────────────────────────────────
  const deviceLabels = Object.keys(stats.device_breakdown);
  const deviceCounts = Object.values(stats.device_breakdown);

  const doughnutData = {
    labels: deviceLabels,
    datasets: [{
      data: deviceCounts,
      backgroundColor: [
        "#22c55e","#3b82f6","#f59e0b","#ef4444",
        "#8b5cf6","#06b6d4","#ec4899",
      ],
      borderWidth: 2,
      borderColor: "#fff",
    }],
  };

  const hotspotLabels = stats.hotspots.map((h) => h.location);
  const hotspotCounts = stats.hotspots.map((h) => h.count);

  const barData = {
    labels: hotspotLabels,
    datasets: [{
      label: "Devices Scanned",
      data: hotspotCounts,
      backgroundColor: "#22c55e",
      borderRadius: 6,
    }],
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Government Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Real-time e-waste intelligence for policy makers and administrators.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          icon={<BarChart3 className="text-blue-500" size={24} />}
          label="Total Devices Scanned"
          value={stats.total_devices_scanned.toLocaleString()}
          colour="bg-blue-50 border-blue-200"
        />
        <StatCard
          icon={<Leaf className="text-green-500" size={24} />}
          label="Total CO₂ Saved"
          value={`${stats.total_carbon_saved_kg.toLocaleString()} kg`}
          sub="carbon emissions avoided"
          colour="bg-green-50 border-green-200"
        />
        <StatCard
          icon={<IndianRupee className="text-orange-500" size={24} />}
          label="Material Value Recovered"
          value={`₹ ${stats.total_material_value_inr.toLocaleString()}`}
          sub="estimated recoverable value"
          colour="bg-orange-50 border-orange-200"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Device breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Device Category Breakdown</h3>
          <div className="max-w-xs mx-auto">
            <Doughnut data={doughnutData}
                      options={{ plugins: { legend: { position: "bottom" } } }} />
          </div>
        </div>

        {/* Hotspots */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            <MapPin className="inline mr-1 text-red-500" size={16} />
            E-Waste Hotspots
          </h3>
          <Bar data={barData}
               options={{
                 responsive: true,
                 plugins: { legend: { display: false } },
                 scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
               }} />
        </div>
      </div>
    </main>
  );
}