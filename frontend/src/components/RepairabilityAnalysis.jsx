// RepairabilityAnalysis.jsx
import { Wrench } from "lucide-react";

const DIFFICULTY_COLORS = {
  Low: "text-green-600",
  Medium: "text-yellow-600",
  High: "text-red-600",
};

export default function RepairabilityAnalysis({ summary = {} }) {
  const {
    repair_difficulty = "Medium",
    estimated_repair_cost_low = 0,
    estimated_repair_cost_high = 0,
    repair_success_probability = 0,
    economically_worth_repair = false,
  } = summary;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover">
      <div className="flex items-center gap-2 mb-5">
        <Wrench className="text-orange-500" size={22} />
        <h3 className="font-semibold text-gray-800 text-lg">Repairability Analysis</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Repair Difficulty</p>
          <p className={`text-lg font-bold ${DIFFICULTY_COLORS[repair_difficulty] || "text-gray-700"}`}>
            {repair_difficulty}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Estimated Cost</p>
          <p className="text-lg font-bold text-gray-800">
            ₹{estimated_repair_cost_low.toLocaleString()}–{estimated_repair_cost_high.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Success Probability</p>
          <p className="text-lg font-bold text-gray-800">{repair_success_probability}%</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${economically_worth_repair ? "bg-green-50" : "bg-red-50"}`}>
          <p className="text-xs text-gray-500 mb-1">Worth Repairing?</p>
          <p className={`text-lg font-bold ${economically_worth_repair ? "text-green-700" : "text-red-700"}`}>
            {economically_worth_repair ? "Yes" : "No"}
          </p>
        </div>
      </div>
    </div>
  );
}
