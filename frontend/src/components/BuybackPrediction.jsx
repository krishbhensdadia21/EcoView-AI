// BuybackPrediction.jsx
import { TrendingUp, IndianRupee } from "lucide-react";

export default function BuybackPrediction({ 
  currentPrice = 0, 
  afterRepairPrice = 0, 
  profit = 0, 
  shouldRepair = false 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-purple-500" size={22} />
        <h3 className="font-semibold text-gray-800 text-lg">Buyback Price Prediction</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">Current Resale</p>
          <p className="text-xl font-bold text-gray-800">₹{currentPrice.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">After Repair</p>
          <p className="text-xl font-bold text-blue-700">₹{afterRepairPrice.toLocaleString()}</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${profit > 0 ? "bg-green-50" : "bg-red-50"}`}>
          <p className="text-xs text-gray-500">Potential Profit</p>
          <p className={`text-xl font-bold ${profit > 0 ? "text-green-700" : "text-red-700"}`}>
            {profit > 0 ? "+" : ""}₹{profit.toLocaleString()}
          </p>
        </div>
        <div className={`rounded-xl p-3 text-center ${shouldRepair ? "bg-green-100" : "bg-gray-100"}`}>
          <p className="text-xs text-gray-500">Recommendation</p>
          <p className={`text-sm font-bold ${shouldRepair ? "text-green-700" : "text-gray-600"}`}>
            {shouldRepair ? "Repair for Resale" : "Sell for Recycling"}
          </p>
        </div>
      </div>
    </div>
  );
}