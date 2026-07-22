// ComponentList.jsx
import { Cpu } from "lucide-react";

const CONDITION_COLORS = {
  Good: "bg-green-100 text-green-700",
  Fair: "bg-yellow-100 text-yellow-700",
  Poor: "bg-red-100 text-red-700",
};

export default function ComponentList({ components = [] }) {
  if (!components || components.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover">
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="text-blue-500" size={22} />
        <h3 className="font-semibold text-gray-800 text-lg">Component Analysis</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {components.map((comp, idx) => (
          <div key={idx} className="border border-gray-100 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800">{comp.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${CONDITION_COLORS[comp.condition] || "bg-gray-100"}`}>
                {comp.condition || "Unknown"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {comp.weight_grams}g · {comp.material}
            </p>
            {comp.recoverable_value_inr > 0 && (
              <p className="text-xs font-medium text-green-600 mt-1">
                ₹{comp.recoverable_value_inr} recoverable
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}