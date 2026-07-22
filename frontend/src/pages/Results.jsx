// /frontend/src/pages/Results.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DeviceIdentification from "../components/DeviceIdentification";
import VisualInspection from "../components/VisualInspection";
import UserReportedIssue from "../components/UserReportedIssue";
import AIDiagnosticInsights from "../components/AIDiagnosticInsights";
import ConditionAssessment from "../components/ConditionAssessment";
import RepairabilityAnalysis from "../components/RepairabilityAnalysis";
import MaterialRecovery from "../components/MaterialRecovery";
import BuybackPrediction from "../components/BuybackPrediction";
import CarbonSavings from "../components/CarbonSavings";
import FinalRecommendation from "../components/FinalRecommendation";
import Marketplace from "../components/Marketplace";
import DownloadReport from "../components/DownloadReport";
import ComponentList from "../components/ComponentList";

import { ArrowLeft, Eye, Activity, DollarSign, Handshake, FileDown } from "lucide-react";

function buildFinalRecommendationReasons(result) {
  const reasons = [];
  const obs = result.visual_observations || {};

  if (obs.is_screen_cracked) reasons.push("Screen severely damaged");
  else if (obs.is_severely_damaged) reasons.push("Significant physical damage detected");

  if (result.user_problem) reasons.push(`Reported issue: ${result.user_problem}`);

  const summary = result.repairability_summary || {};
  if (summary.economically_worth_repair === false) reasons.push("Low repair feasibility");
  else if (summary.economically_worth_repair === true) reasons.push("Repair is economically viable");

  if ((result.material_value_inr || 0) > 0 && result.recommendation === "Recycle") {
    reasons.push("Material recovery value is higher than resale/repair value");
  }
  if (result.recommendation === "Reuse") reasons.push("Device is in good working condition");
  if (result.recommendation === "Refurbish") reasons.push("Device has reasonable refurbishment potential");

  if (reasons.length === 0 && result.recommendation_reason) reasons.push(result.recommendation_reason);

  return reasons;
}

// Mirrors VisualInspection.jsx's own checklist-building logic exactly, so
// the PDF report shows the identical rows the user already sees on screen.
//
// The visualRows array is passed to generateScanReport to ensure consistency.
function buildVisualRows(observations = {}) {
  const {
    is_screen_cracked,
    has_physical_impact_damage,
    is_stand_or_housing_intact,
    has_missing_parts,
    physical_damage = [],
  } = observations;

  const rows = [];
  if (is_screen_cracked) rows.push({ label: "Screen severely cracked", ok: false });
  if (has_physical_impact_damage) rows.push({ label: "Physical impact detected", ok: false });
  rows.push({ label: "Stand intact", ok: !!is_stand_or_housing_intact });
  rows.push({ label: has_missing_parts ? "Missing parts detected" : "No visible missing parts", ok: !has_missing_parts });

  physical_damage.forEach((d) => {
    const already = rows.some((r) => r.label.toLowerCase() === d.toLowerCase());
    if (!already) rows.push({ label: d, ok: false });
  });

  return rows;
}

export default function Results() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const raw = sessionStorage.getItem("scanResult");
    if (!raw) { 
      navigate("/scan"); 
      return; 
    }
    try {
      const parsedResult = JSON.parse(raw);
      setResult(parsedResult);
    } catch (error) {
      console.error("Error parsing scan result:", error);
      navigate("/scan");
    }
  }, [navigate]);

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Loading results...</p>
      </div>
    );
  }

  const isUnknown = result.device_type?.toLowerCase().includes("unknown") ||
                    result.device_type === "Electronic Device";

  // Fix: Remove duplicate brand from device type
  let deviceDisplayName = result.device_type || "Device";
  if (result.brand && result.brand !== "Unknown" && !deviceDisplayName.toLowerCase().includes(result.brand.toLowerCase())) {
    deviceDisplayName = `${result.brand} ${deviceDisplayName}`;
  }

  // Computed once, reused by both the on-screen recommendation card and the PDF report
  const reasons = buildFinalRecommendationReasons(result);
  const visualRows = buildVisualRows(result.visual_observations);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <button onClick={() => navigate("/scan")}
              className="flex items-center gap-1 text-gray-500 hover:text-green-600 text-sm transition-colors mb-2">
        <ArrowLeft size={16} /> Back to scan
      </button>

      {isUnknown && (
        <p className="text-sm text-gray-400 -mt-2">
          Device identified with low confidence — try uploading a clearer image for better results.
        </p>
      )}

      {/* Tab Selectors */}
      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: "overview", label: "Overview", icon: <Eye size={16} /> },
          { id: "diagnostics", label: "AI Diagnostics", icon: <Activity size={16} /> },
          { id: "financial", label: "Eco-Impact & Value", icon: <DollarSign size={16} /> },
          { id: "report", label: "Download Report", icon: <FileDown size={16} /> },
          { id: "partners", label: "Partners & Actions", icon: <Handshake size={16} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap
                ${isActive 
                  ? "border-green-600 text-green-600 bg-green-50/30" 
                  : "border-transparent text-gray-500 hover:text-green-600 hover:border-gray-200"}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6 fade-in">
        {activeTab === "overview" && (
          <>
            <FinalRecommendation
              recommendation={result.recommendation}
              reasons={reasons}
            />
            <DeviceIdentification
              deviceType={deviceDisplayName}
              category={result.device_category}
              confidence={result.identification_confidence}
              age={result.estimated_age}
            />
            <VisualInspection
              observations={result.visual_observations}
              overallCondition={result.condition}
            />
          </>
        )}

        {activeTab === "diagnostics" && (
          <>
            <UserReportedIssue problem={result.user_problem} />
            <AIDiagnosticInsights causes={result.possible_causes} />
            <ConditionAssessment
              condition={result.condition}
              repairability={result.repairability_score}
              reuse={result.reuse_score}
              recycle={result.recycle_score}
              ecoScore={result.eco_score}
            />
            <RepairabilityAnalysis summary={result.repairability_summary} />
          </>
        )}

        {activeTab === "financial" && (
          <>
            <MaterialRecovery materials={result.materials} valueInr={result.material_value_inr} />
            <BuybackPrediction
              currentPrice={result.buyback_price_current}
              afterRepairPrice={result.buyback_price_after_repair}
              profit={result.repair_profit}
              shouldRepair={result.should_repair_for_resale}
            />
            <CarbonSavings
              carbonKg={result.carbon_saved_kg}
              waterLiters={result.water_saved_liters}
              landfillKg={result.landfill_reduction_kg}
            />
          </>
        )}

        {activeTab === "report" && (
          <DownloadReport
            result={result}
            deviceDisplayName={deviceDisplayName}
            reasons={reasons}
            visualRows={visualRows}
          />
        )}

        {activeTab === "partners" && (
          <>
            <Marketplace partners={result.matched_partners} />
          </>
        )}
      </div>
    </main>
  );
}