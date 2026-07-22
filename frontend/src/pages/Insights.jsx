// /frontend/src/pages/Insights.jsx
import { useState } from "react";
import axios from "axios";
import { Lightbulb, Send, TrendingUp, Building, Users, MapPin } from "lucide-react";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Insights() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/dashboard/insights`, {
        question: question
      });
      setAnswer(data);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to get insights.");
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const { data } = await axios.get(`${API}/dashboard/recommendations`);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      toast.error("Failed to load recommendations.");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'collection': return <MapPin size={16} />;
      case 'infrastructure': return <Building size={16} />;
      case 'policy': return <Users size={16} />;
      default: return <TrendingUp size={16} />;
    }
  };

  const suggestions = [
    "Which city produces the most laptop waste?",
    "What is the average EcoScore of devices?",
    "Which brand has the highest repairability?",
    "Where should we build the next recycling plant?",
    "How can we reduce e-waste in Delhi?"
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>

        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Lightbulb className="text-yellow-500" size={28} />
          AI Procurement Insights
        </h2>
      </div>

      {/* Question Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover">
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask a question about e-waste data..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:hover:translate-y-0 flex items-center gap-2"
          >
            <Send size={18} />
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>

        {/* Suggestions */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
            Suggested Query Templates
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setQuestion(s)}
                className="text-xs p-3 bg-gray-50 hover:bg-green-50/50 hover:text-green-700 rounded-xl text-gray-600 transition-all border border-gray-100 hover:border-green-200 text-left font-medium flex items-start gap-2 shadow-sm"
              >
                <span className="text-[10px] bg-white border border-gray-100 rounded-md p-1 leading-none text-gray-450 shrink-0">💡</span>
                <span>{s}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answer Display */}
      {answer && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 fade-in">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 rounded-full p-2 mt-1">
              <Lightbulb className="text-white" size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">AI Insight</p>
              <p className="text-gray-800 whitespace-pre-wrap">{answer.answer}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-lg">Procurement Recommendations</h3>
          <button
            onClick={loadRecommendations}
            disabled={loadingRecommendations}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            {loadingRecommendations ? "Loading..." : recommendations.length > 0 ? "Refresh" : "Load Recommendations"}
          </button>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid gap-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-xl border p-4 flex items-start gap-4 card-hover ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex-shrink-0">
                  {getCategoryIcon(rec.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getPriorityColor(rec.priority)}`}>
                      {rec.priority || "Medium"} Priority
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{rec.category || "General"}</span>
                  </div>
                  <p className="text-sm text-gray-800 mt-1">{rec.recommendation}</p>
                  {rec.impact && (
                    <p className="text-xs text-gray-500 mt-1">💡 {rec.impact}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loadingRecommendations && (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-gray-400 text-sm">
                Click "Load Recommendations" to get AI-powered procurement suggestions.
              </p>
            </div>
          )
        )}
      </div>
    </main>
  );
}