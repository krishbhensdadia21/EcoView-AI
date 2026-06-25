import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { UploadCloud, MapPin, Loader2 } from "lucide-react";

const API = "http://localhost:8000";

export default function Scan() {
  const navigate  = useNavigate();
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [location, setLocation] = useState("");
  const [loading,  setLoading]  = useState(false);

  // ── Dropzone ──────────────────────────────────────────
  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
  });

  // ── Submit ────────────────────────────────────────────
  const handleScan = async () => {
    if (!file) { toast.error("Please upload an image first."); return; }

    setLoading(true);
    const formData = new FormData();
    formData.append("file",     file);
    formData.append("location", location || "India");

    try {
      const { data } = await axios.post(`${API}/scan/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Store result in sessionStorage so Results page can read it
      sessionStorage.setItem("scanResult", JSON.stringify(data));
      navigate("/results");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Scan Your Device</h2>
      <p className="text-gray-500 mb-8">
        Upload a clear photo of any electronic device for instant AI analysis.
      </p>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
                    transition-colors mb-6
                    ${isDragActive
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-green-400 bg-white"
                    }`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <img src={preview} alt="Preview"
               className="mx-auto max-h-56 rounded-xl object-contain" />
        ) : (
          <>
            <UploadCloud className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500">
              {isDragActive
                ? "Drop it here…"
                : "Drag & drop an image, or click to browse"}
            </p>
            <p className="text-xs text-gray-400 mt-1">JPEG · PNG · WEBP · max 10 MB</p>
          </>
        )}
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 bg-white border border-gray-200
                      rounded-xl px-4 py-3 mb-6">
        <MapPin className="text-green-500" size={18} />
        <input
          type="text"
          placeholder="Your city (e.g. Mumbai, Delhi)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1 outline-none text-sm text-gray-700"
        />
      </div>

      {/* CTA */}
      <button
        onClick={handleScan}
        disabled={loading || !file}
        className="w-full flex items-center justify-center gap-2
                   bg-green-600 hover:bg-green-700 disabled:bg-green-300
                   text-white font-semibold py-3 rounded-xl
                   transition-all duration-200 text-base"
      >
        {loading
          ? <><Loader2 className="animate-spin" size={20} /> Analysing…</>
          : "Analyse Device"}
      </button>
    </main>
  );
}