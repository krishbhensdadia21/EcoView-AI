/**
 * Displays a circular score gauge for each AI-generated score.
 */

const scores = [
  { key: "reuse_score",        label: "Reuse",         colour: "#22c55e" },
  { key: "repair_score",       label: "Repair",        colour: "#3b82f6" },
  { key: "repairability_score",label: "Repairability", colour: "#f59e0b" },
  { key: "recycle_score",      label: "Recycle",       colour: "#ef4444" },
];

function CircleGauge({ value, colour, label }) {
  const radius      = 40;
  const circumference = 2 * Math.PI * radius;
  const offset      = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* Track */}
        <circle cx="50" cy="50" r={radius}
                fill="none" stroke="#e5e7eb" strokeWidth="10" />
        {/* Progress */}
        <circle cx="50" cy="50" r={radius}
                fill="none"
                stroke={colour}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="50" y="55" textAnchor="middle"
              fontSize="18" fontWeight="bold" fill="#1f2937">
          {value}
        </text>
      </svg>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
  );
}

export default function HealthScore({ result }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-800 text-lg mb-6">
        E-Waste Health Score
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
        {scores.map((s) => (
          <CircleGauge
            key={s.key}
            value={result[s.key] ?? 0}
            colour={s.colour}
            label={s.label}
          />
        ))}
      </div>
    </div>
  );
}