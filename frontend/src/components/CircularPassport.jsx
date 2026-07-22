// CircularPassport.jsx
import { QrCode, Award, History, Wrench, Layers, RotateCw, Clock, CheckCircle } from "lucide-react";

const MATERIAL_LABELS = {
  copper_grams: "Copper (g)",
  aluminium_grams: "Aluminium (g)",
  gold_mg: "Gold (mg)",
  silver_grams: "Silver (g)",
  plastic_grams: "Plastic (g)",
  glass_grams: "Glass (g)",
  rubber_grams: "Rubber (g)",
  steel_grams: "Steel (g)",
};

export default function CircularPassport({
  passportId,
  qrUrl,
  ecoPoints = 0,
  passportNote,
  history = [],
  isUpdated = false,
  scanCount = 1,
}) {
  // Handle both old and new history formats
  let ownershipHistory = [];
  let repairHistory = [];
  let materialComposition = {};

  if (Array.isArray(history)) {
    // New format: array of events
    ownershipHistory = history.filter(item => item.event.includes('Scan') || item.event.includes('Ownership'));
    repairHistory = history.filter(item => item.event.includes('Repair') || item.event.includes('Fix'));
    
    // Extract materials from the latest scan if available
    const latestScan = history.find(item => item.event === 'Initial Scan' || item.event === 'Re-scan');
    if (latestScan && latestScan.materials) {
      materialComposition = latestScan.materials;
    }
  } else if (typeof history === 'object' && history !== null) {
    // Old format: object with properties
    ownershipHistory = history.ownership_history || [];
    repairHistory = history.repair_history || [];
    materialComposition = history.material_composition || {};
  }

  // Get latest event for showing status
  const latestEvent = Array.isArray(history) && history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-800 text-lg">Circular Economy Passport</h3>
        {isUpdated && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full">
            <RotateCw size={14} className="animate-spin-slow" />
            Updated
          </span>
        )}
        {scanCount > 1 && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
            <Clock size={14} />
            Scan #{scanCount}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-emerald-50 rounded-xl p-4 mb-5">
        <div className="bg-white rounded-lg p-2 shadow-sm">
          <QrCode className="text-emerald-600" size={36} />
        </div>
        <div>
          <p className="text-xs text-gray-500">Passport ID</p>
          <p className="font-mono font-bold text-emerald-700 text-lg">#{passportId}</p>
          {qrUrl && <p className="text-xs text-gray-400 break-all max-w-xs truncate">{qrUrl}</p>}
        </div>
        <div className="flex items-center gap-2 ml-auto bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100">
          <Award className="text-yellow-500" size={22} />
          <div>
            <span className="font-bold text-gray-700">{ecoPoints}</span>
            <span className="text-xs text-gray-500 ml-1">EcoPoints</span>
          </div>
        </div>
      </div>

      {passportNote && (
        <div className={`text-xs px-4 py-2.5 rounded-lg mb-5 ${
          isUpdated ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-50 text-gray-500'
        }`}>
          {passportNote}
        </div>
      )}

      {/* Scan History - New section for tracking device journey */}
      {Array.isArray(history) && history.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-2">
            <History size={15} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Device Journey</p>
          </div>
          <div className="relative pl-4 border-l-2 border-emerald-200 space-y-3">
            {history.slice(0, 5).map((event, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{event.event}</p>
                    <p className="text-xs text-gray-500">{event.details || event.date || 'No details'}</p>
                  </div>
                  {event.date && (
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(event.date).toLocaleDateString('en-IN', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {history.length > 5 && (
              <p className="text-xs text-gray-400 pl-2">+{history.length - 5} more events</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ownership history */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <History size={15} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ownership History</p>
          </div>
          {ownershipHistory.length === 0 && !Array.isArray(history) ? (
            <p className="text-xs text-gray-400">No prior records</p>
          ) : ownershipHistory.length === 0 && Array.isArray(history) ? (
            <p className="text-xs text-gray-400">Current owner only</p>
          ) : (
            <ul className="space-y-1.5">
              {ownershipHistory.slice(0, 3).map((e, i) => (
                <li key={i} className="text-xs text-gray-600">
                  <span className="font-medium text-gray-700">{e.event}</span> — {e.owner || 'User'} ({e.date || 'Recent'})
                </li>
              ))}
              {ownershipHistory.length > 3 && (
                <li className="text-xs text-gray-400">+{ownershipHistory.length - 3} more</li>
              )}
            </ul>
          )}
        </div>

        {/* Repair history */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Wrench size={15} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Repair History</p>
          </div>
          {repairHistory.length === 0 && !Array.isArray(history) ? (
            <p className="text-xs text-gray-400">No repairs on record</p>
          ) : repairHistory.length === 0 && Array.isArray(history) ? (
            <p className="text-xs text-gray-400">No repairs yet</p>
          ) : (
            <ul className="space-y-1.5">
              {repairHistory.slice(0, 3).map((r, i) => (
                <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                  <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />
                  <span>{typeof r === 'string' ? r : r.event}</span>
                </li>
              ))}
              {repairHistory.length > 3 && (
                <li className="text-xs text-gray-400">+{repairHistory.length - 3} more</li>
              )}
            </ul>
          )}
        </div>

        {/* Material composition */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Layers size={15} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Material Composition</p>
          </div>
          {Object.keys(materialComposition).length === 0 ? (
            <p className="text-xs text-gray-400">Not available</p>
          ) : (
            <ul className="space-y-1">
              {Object.entries(materialComposition).slice(0, 5).map(([key, qty]) => (
                <li key={key} className="text-xs text-gray-600 flex justify-between">
                  <span>{MATERIAL_LABELS[key] || key}</span>
                  <span className="font-medium text-gray-700">{qty}</span>
                </li>
              ))}
              {Object.keys(materialComposition).length > 5 && (
                <li className="text-xs text-gray-400">+{Object.keys(materialComposition).length - 5} more</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Status indicator for passport validity */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Last updated: {latestEvent?.date ? new Date(latestEvent.date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : 'Just now'}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-green-600">
          <CheckCircle size={14} />
          Active
        </span>
      </div>
    </div>
  );
}