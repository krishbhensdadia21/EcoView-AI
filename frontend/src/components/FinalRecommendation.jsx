// FinalRecommendation.jsx
import { Recycle, Wrench, RefreshCw, Repeat } from "lucide-react";

const REC_CONFIG = {
  Reuse: { bg: "bg-green-50", border: "border-green-300", text: "text-green-700", icon: Repeat },
  Repair: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", icon: Wrench },
  Refurbish: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", icon: RefreshCw },
  Recycle: { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", icon: Recycle },
};

export default function FinalRecommendation({ recommendation = "Recycle", reasons = [] }) {
  const cfg = REC_CONFIG[recommendation] || REC_CONFIG.Recycle;
  const Icon = cfg.icon;

  return (
    <div className={`rounded-2xl border-2 ${cfg.bg} ${cfg.border} p-7`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`rounded-full p-3 bg-white ${cfg.text}`}>
          <Icon size={28} />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Recommendation</p>
          <p className={`text-3xl font-extrabold ${cfg.text}`}>{recommendation}</p>
        </div>
      </div>

      {reasons.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {reasons.map((r, i) => (
            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${cfg.text.replace("text", "bg")}`} />
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
