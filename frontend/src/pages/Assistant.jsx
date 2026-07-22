// /frontend/src/pages/Assistant.jsx
import { MessageCircle } from "lucide-react";
import ChatWidget from "../components/ChatWidget";

export default function Assistant() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700
                        bg-green-100 px-3 py-1 rounded-full mb-4">
        <MessageCircle size={13} /> Always available
      </span>

      <div className="h-[620px]">
        <ChatWidget />
      </div>

      <div className="mt-4 text-center text-xs text-gray-400">
        <MessageCircle size={12} className="inline mr-1" />
        Powered by Groq AI · Supports voice input in Hindi, English, and Indian languages
      </div>
    </main>
  );
}