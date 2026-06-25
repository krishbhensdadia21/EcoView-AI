import { Cpu } from "lucide-react";

// Material display config
const MATERIAL_META = {
  copper_grams:    { label: "Copper",    unit: "g",  colour: "bg-orange-100 text-orange-700" },
  aluminium_grams: { label: "Aluminium", unit: "g",  colour: "bg-gray-100   text-gray-700"   },
  gold_mg:         { label: "Gold",      unit: "mg", colour: "bg-yellow-100 text-yellow-700" },
  silver_grams:    { label: "Silver",    unit: "g",  colour: "bg-blue-100   text-blue-700"   },
  plastic_grams:   { label: "Plastic",   unit: "g",  colour: "bg-green-100  text-green-700"  },
};

export default function MaterialRecovery({ materials = {}, valueInr = 0 }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="text-orange-500" size={22} />
        <h3 className="font-semibold text-gray-800 text-lg">
          Material Recovery Estimator
        </h3>
      </div>

      {/* Material pills */}
      <div className="flex flex-wrap gap-3 mb-5">
        {Object.entries(materials).map(([key, qty]) => {
          const meta = MATERIAL_META[key];
          if (!meta) return null;
          return (
            <span key={key}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${meta.colour}`}>
              {meta.label}: {qty} {meta.unit}
            </span>
          );
        })}
      </div>

      {/* Value highlight */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-500 mb-1">Estimated Recoverable Value</p>
        <p className="text-3xl font-extrabold text-orange-600">
          ₹ {valueInr.toFixed(2)}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Based on current material market rates
        </p>
      </div>
    </div>
  );
}