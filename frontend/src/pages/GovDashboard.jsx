import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { BarChart3, Leaf, IndianRupee, MapPin, LayoutDashboard } from "lucide-react";

ChartJS.register(ArcElement, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend);

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Tailwind stat card
function StatCard({ icon, label, value, sub, colour }) {
  return (
    <div className={`rounded-2xl p-5 border card-hover ${colour}`}>
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
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <div className="space-y-2">
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-9 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </main>
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
        "#22c55e", "#3b82f6", "#f59e0b", "#ef4444",
        "#8b5cf6", "#06b6d4", "#ec4899",
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
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">


      {/* Stat Cards */}
      < div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          icon={<BarChart3 className="text-blue-500" size={24} />}
          label="Total Devices Scanned"
          value={stats.total_devices_scanned.toLocaleString()}
          colour="bg-blue-50/50 border-blue-100 shadow-sm"
        />
        <StatCard
          icon={<Leaf className="text-green-500" size={24} />}
          label="Total CO₂ Saved"
          value={`${stats.total_carbon_saved_kg.toLocaleString()} kg`}
          sub="carbon emissions avoided"
          colour="bg-green-50/50 border-green-100 shadow-sm"
        />
        <StatCard
          icon={<IndianRupee className="text-orange-500" size={24} />}
          label="Material Value Recovered"
          value={`₹ ${stats.total_material_value_inr.toLocaleString()}`}
          sub="estimated recoverable value"
          colour="bg-orange-50/50 border-orange-100 shadow-sm"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Device breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between card-hover">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Category Breakdown</h3>
            <p className="text-xs text-gray-400 mb-4">Device type category ratio</p>
          </div>
          <div className="max-w-[200px] mx-auto my-auto w-full flex items-center justify-center">
            <Doughnut data={doughnutData}
              options={{ plugins: { legend: { display: false } } }} />
          </div>
          {/* Custom legend grid */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-gray-500 font-medium border-t border-gray-50 pt-3">
            {deviceLabels.map((lbl, idx) => (
              <div key={lbl} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[idx] }} />
                <span className="truncate">{lbl} ({deviceCounts[idx]})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hotspots Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between card-hover">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Regional Scans</h3>
            <p className="text-xs text-gray-400 mb-4">Activity volume by hotspot location</p>
          </div>
          <div className="my-auto">
            <Bar data={barData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: "#f3f4f6" }, ticks: { stepSize: 1, color: "#9ca3af", font: { size: 10 } } },
                  x: { grid: { display: false }, ticks: { color: "#9ca3af", font: { size: 10 } } }
                },
              }} />
          </div>
        </div>

        {/* Hotspots Table List (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between card-hover">
          <div>
            <h3 className="font-semibold text-gray-850 mb-2 flex items-center gap-1.5">
              <MapPin className="text-red-500" size={16} />
              Hotspot Ranking
            </h3>
            <p className="text-xs text-gray-400 mb-4">Highest scanning regions</p>
          </div>
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {stats.hotspots.map((h, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100/50 hover:bg-green-50/40 transition-colors duration-200">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-gray-400 w-4">#{idx + 1}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{h.location}</p>
                    <p className="text-[9px] text-gray-400 truncate">India Region</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200/50 px-2 py-0.5 rounded-full">
                    {h.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main >
  );
}