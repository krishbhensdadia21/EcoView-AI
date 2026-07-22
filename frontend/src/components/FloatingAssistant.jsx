// /frontend/src/components/FloatingAssistant.jsx
import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatWidget from "./ChatWidget";

// Global floating action button — mounted once in App.jsx (outside <Routes>)
// so it shows on every page, for both regular users and admins.
export default function FloatingAssistant() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Popup panel */}
      {open && (
        <div
          className="fixed z-50 bottom-24 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-24
                     w-auto sm:w-[360px] h-[70vh] sm:h-[500px] max-h-[600px]
                     shadow-2xl rounded-2xl overflow-hidden fade-in"
        >
          <ChatWidget compact />
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="fixed z-50 bottom-5 right-5 w-14 h-14 rounded-full
                   bg-gradient-to-br from-green-600 to-emerald-600 text-white
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5
                   flex items-center justify-center transition-all duration-200"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}