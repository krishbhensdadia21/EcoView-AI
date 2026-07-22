// VisualInspection.jsx
import { Eye, Check, X } from "lucide-react";

const CONDITION_COLORS = {
  Excellent: "text-green-600",
  Good: "text-green-600",
  Fair: "text-yellow-600",
  Poor: "text-red-600",
};

function CheckRow({ label, ok }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <Check size={16} className="text-green-500 shrink-0" />
      ) : (
        <X size={16} className="text-red-500 shrink-0" />
      )}
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
}

export default function VisualInspection({ observations = {}, overallCondition = "Fair" }) {
  const {
    is_screen_cracked,
    has_physical_impact_damage,
    is_stand_or_housing_intact,
    has_missing_parts,
    physical_damage = [],
  } = observations;

  // Build the checklist purely from observed booleans (Section 2 spec: observed only).
  const rows = [];
  if (is_screen_cracked) rows.push({ label: "Screen severely cracked", ok: false });
  if (has_physical_impact_damage) rows.push({ label: "Physical impact detected", ok: false });
  rows.push({ label: "Stand intact", ok: !!is_stand_or_housing_intact });
  rows.push({ label: has_missing_parts ? "Missing parts detected" : "No visible missing parts", ok: !has_missing_parts });

  // Surface any additional model-reported damage phrases not already covered above
  physical_damage.forEach((d) => {
    const already = rows.some((r) => r.label.toLowerCase() === d.toLowerCase());
    if (!already) rows.push({ label: d, ok: false });
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="text-blue-500" size={22} />
        <h3 className="font-semibold text-gray-800 text-lg">Visual Inspection</h3>
        <span className="text-xs text-gray-400 ml-auto">Computer Vision Output</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 mb-5">
        {rows.map((r, i) => (
          <CheckRow key={i} label={r.label} ok={r.ok} />
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">Overall Visual Condition</span>
        <span className={`text-lg font-bold ${CONDITION_COLORS[overallCondition] || "text-gray-700"}`}>
          {overallCondition}
        </span>
      </div>
    </div>
  );
}
