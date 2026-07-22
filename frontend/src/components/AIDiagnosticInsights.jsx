// AIDiagnosticInsights.jsx
import { Stethoscope } from "lucide-react";

function barColour(pct) {
  if (pct >= 70) return "bg-red-500";
  if (pct >= 40) return "bg-orange-500";
  return "bg-yellow-500";
}

export default function AIDiagnosticInsights({ causes = [] }) {
  if (!causes || causes.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover">
      <div className="flex items-center gap-2 mb-4">
        <Stethoscope className="text-rose-500" size={22} />
        <h3 className="font-semibold text-gray-800 text-lg">AI Diagnostic Insights</h3>
      </div>

     

      <div className="space-y-3">
        {causes.map((c, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{c.cause}</span>
              <span className="text-sm font-bold text-gray-700">{c.likelihood}%</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${barColour(c.likelihood)}`}
                style={{ width: `${Math.min(100, c.likelihood)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-5 italic">
        These are AI-estimated probabilities based on visual damage and the reported issue.
        Internal inspection is required for confirmation.
      </p>
    </div>
  );
}
