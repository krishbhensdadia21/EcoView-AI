// ConditionAssessment.jsx
import { Gauge } from "lucide-react";

const CONDITION_COLORS = {
  Excellent: "text-green-600",
  Good: "text-green-600",
  Fair: "text-yellow-600",
  Poor: "text-red-600",
};

function StatBar({ label, value, colour }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-bold text-gray-800">{value}%</span>
      </div>
      <div className="bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${colour}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

export default function ConditionAssessment({
  condition = "Fair",
  repairability = 0,
  reuse = 0,
  recycle = 0,
  ecoScore = 0,
}) {
  const ecoColour =
    ecoScore >= 80 ? "text-green-600" : ecoScore >= 60 ? "text-yellow-500" : ecoScore >= 40 ? "text-orange-500" : "text-red-500";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover">
      <div className="flex items-center gap-2 mb-5">
        <Gauge className="text-emerald-500" size={22} />
        <h3 className="font-semibold text-gray-800 text-lg">Condition Assessment</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Overall + EcoScore */}
        <div className="flex gap-4">
          <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Overall Condition</p>
            <p className={`text-2xl font-extrabold ${CONDITION_COLORS[condition] || "text-gray-700"}`}>
              {condition}
            </p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">EcoScore</p>
            <p className={`text-2xl font-extrabold ${ecoColour}`}>{ecoScore}<span className="text-base text-gray-400">/100</span></p>
          </div>
        </div>

        {/* Right: bars */}
        <div className="space-y-3">
          <StatBar label="Repairability" value={repairability} colour="bg-blue-500" />
          <StatBar label="Reuse Potential" value={reuse} colour="bg-green-500" />
          <StatBar label="Recycle Potential" value={recycle} colour="bg-orange-500" />
        </div>
      </div>
    </div>
  );
}
