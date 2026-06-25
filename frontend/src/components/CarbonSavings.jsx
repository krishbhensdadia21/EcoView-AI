import { Wind, Droplets } from "lucide-react";

export default function CarbonSavings({ carbonKg = 0, waterLiters = 0 }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-800 text-lg mb-5">
        🌍 Environmental Impact Saved
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* CO₂ */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <Wind className="mx-auto text-green-500 mb-2" size={28} />
          <p className="text-3xl font-extrabold text-green-700">{carbonKg} kg</p>
          <p className="text-xs text-gray-500 mt-1">CO₂ emissions avoided</p>
        </div>

        {/* Water */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <Droplets className="mx-auto text-blue-500 mb-2" size={28} />
          <p className="text-3xl font-extrabold text-blue-700">{waterLiters} L</p>
          <p className="text-xs text-gray-500 mt-1">water consumption saved</p>
        </div>
      </div>
    </div>
  );
}