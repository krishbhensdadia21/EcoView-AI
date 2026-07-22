// DeviceIdentification.jsx
import { ScanLine } from "lucide-react";

export default function DeviceIdentification({ deviceType, category, confidence = 0, age }) {
  const confColour =
    confidence >= 85 ? "text-green-600" : confidence >= 60 ? "text-yellow-600" : "text-orange-600";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover">
      <div className="flex items-center gap-2 mb-4">
        <ScanLine className="text-emerald-500" size={22} />
        <h3 className="font-semibold text-gray-800 text-lg">Device Identification</h3>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-bold text-gray-800">{deviceType}</p>
          <p className="text-sm text-gray-500 mt-1">{category}</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-extrabold ${confColour}`}>{confidence}%</p>
          <p className="text-xs text-gray-400">Confidence</p>
        </div>
      </div>

      <div className="mt-4 bg-gray-50 rounded-lg px-4 py-2 inline-block">
        <span className="text-xs text-gray-500">Estimated Age: </span>
        <span className="text-sm font-medium text-gray-700">{age}</span>
      </div>
    </div>
  );
}
