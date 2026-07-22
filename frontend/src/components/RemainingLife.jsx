// RemainingLife.jsx
import { Clock, Battery, Cpu, HardDrive, AlertTriangle } from "lucide-react";

export default function RemainingLife({
  available = true,
  unavailableReason = "",
  months = 0,
  confidence = 0,
  failureProbabilities = {},
  predictedFailure = "",
}) {
  const failureItems = [
    { key: "battery", label: "Battery", icon: Battery },
    { key: "motherboard", label: "Motherboard", icon: Cpu },
    { key: "ssd", label: "SSD", icon: HardDrive },
    { key: "fan", label: "Fan", icon: Clock },
  ];

  if (!available) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-indigo-500" size={22} />
          <h3 className="font-semibold text-gray-800 text-lg">Remaining Useful Life</h3>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-semibold text-amber-700">Estimated Remaining Life: Unavailable</p>
            <p className="text-sm text-gray-600 mt-1">{unavailableReason}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-indigo-500" size={22} />
        <h3 className="font-semibold text-gray-800 text-lg">Remaining Useful Life</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <p className="text-4xl font-extrabold text-indigo-700">{months} months</p>
          <p className="text-sm text-gray-500 mt-1">Estimated Remaining Life</p>
          <p className="text-xs text-gray-400 mt-2">Confidence: {confidence}%</p>
          {predictedFailure && (
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Most likely failure: {predictedFailure}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Component Failure Risk</p>
          <div className="space-y-2">
            {failureItems.map((item) => {
              const prob = failureProbabilities[item.key] || 0;
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-center gap-2">
                  <Icon size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${prob > 0.5 ? "bg-red-500" : prob > 0.3 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(100, prob * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-10">{Math.round(prob * 100)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
