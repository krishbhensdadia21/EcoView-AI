// /frontend/src/components/DownloadReport.jsx
import { useState } from "react";
import { FileDown, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import generateScanReport from "../utils/generateScanReport";

export default function DownloadReport({ result, deviceDisplayName, reasons, visualRows }) {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      // Tiny delay so the loading state is visible even on fast devices —
      // otherwise the button flickers for large reports vs instant for small ones.
      await new Promise((r) => setTimeout(r, 300));
      const doc = generateScanReport(result, deviceDisplayName, { reasons, visualRows });
      const filename = `EcoView-Report-${result.passport_id || "scan"}.pdf`;
      doc.save(filename);
      setDone(true);
      toast.success("Report downloaded!");
      setTimeout(() => setDone(false), 2500);
    } catch (err) {
      console.error("Report generation failed:", err);
      toast.error("Couldn't generate the report. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 sm:p-7 text-white flex items-center justify-between flex-wrap gap-4 card-hover">
      <div>
        <p className="text-xs uppercase tracking-wide text-green-100 font-medium mb-1">Full report</p>
        <h3 className="text-xl font-bold">Download your scan report</h3>
        <p className="text-sm text-green-50 mt-1 max-w-md">
          A complete PDF summary — diagnosis, repair options, material recovery, and environmental impact — ready to save or share.
        </p>
      </div>

      <button
        onClick={handleDownload}
        disabled={generating}
        className="flex items-center gap-2 bg-white text-green-700 font-semibold px-5 py-3 rounded-xl
                   shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200
                   disabled:opacity-70 disabled:hover:translate-y-0 shrink-0"
      >
        {generating ? (
          <><Loader2 size={18} className="animate-spin" /> Preparing…</>
        ) : done ? (
          <><CheckCircle2 size={18} className="text-green-600" /> Downloaded</>
        ) : (
          <><FileDown size={18} /> Download PDF</>
        )}
      </button>
    </div>
  );
}