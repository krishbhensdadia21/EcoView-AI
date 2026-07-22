// /frontend/src/components/ChatWidget.jsx
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Shared chat engine for the Green Assistant. Used both by the full
// /assistant page and by the floating chatbot popup (FloatingAssistant.jsx)
// so the logic only lives in one place.
export default function ChatWidget({ compact = false }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm your Green Assistant. Ask me anything about e-waste, recycling, or how to dispose of your devices responsibly!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-IN';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');

        if (event.results[0].isFinal) {
          setInput(transcript);
          setIsRecording(false);
          setTimeout(() => handleSend(transcript), 500);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast.error("Could not recognize speech. Please try typing.");
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleSend = async (text = input) => {
    const message = text.trim();
    if (!message) {
      toast.error("Please enter a message.");
      return;
    }

    setMessages(prev => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/assistant/chat`, {
        question: message,
        device_context: null
      });

      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);

      if (data.response) {
        speakText(data.response);
      }
    } catch (err) {
      toast.error("Failed to get response. Please try again.");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm sorry, I couldn't process your request. Please try again later."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.success("Listening... Speak your question.");
      } catch (error) {
        toast.error("Failed to start recording.");
      }
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const lastMessage = messages.filter(m => m.role === "assistant").pop();
      if (lastMessage) speakText(lastMessage.content);
    }
  };

  const suggestedQuestions = [
    "How do I recycle my old laptop?",
    "What is e-waste and why is it harmful?",
    "How much CO2 can I save by recycling?",
    "Where can I donate old electronics?",
    "What materials can be recovered from a smartphone?"
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Bot className="text-white" size={compact ? 22 : 28} />
          <div className="min-w-0">
            <h2 className={`text-white font-bold ${compact ? "text-base" : "text-xl"}`}>AI Green Assistant</h2>
            {!compact && <p className="text-green-100 text-sm">Your guide to e-waste management and circular economy</p>}
          </div>
          <div className="ml-auto flex gap-2 shrink-0">
            <button
              onClick={toggleRecording}
              className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
              title={isRecording ? "Stop recording" : "Start voice input"}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={toggleSpeaking}
              className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-blue-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
              title={isSpeaking ? "Stop speaking" : "Read response aloud"}
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto px-4 py-3 bg-gray-50 ${compact ? "min-h-0" : "h-[500px]"}`}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-4 flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-500' : 'bg-green-500'}`}>
              {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
            </div>
            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-400 ml-9 text-sm">
            <div className="animate-pulse">Typing</div>
            <span className="animate-bounce">.</span>
            <span className="animate-bounce delay-100">.</span>
            <span className="animate-bounce delay-200">.</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-3 py-3 bg-white shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isRecording ? "🎤 Listening..." : "Type your question..."}
            disabled={isRecording}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 disabled:bg-gray-100"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || isRecording || !input.trim()}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium rounded-xl transition-all duration-200 flex items-center gap-1.5 shrink-0"
          >
            <Send size={16} />
            {!compact && "Send"}
          </button>
        </div>

        {!compact && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 mr-1">Quick questions:</span>
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => { setInput(q); setTimeout(() => handleSend(q), 100); }}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}