// UserReportedIssue.jsx
import { MessageSquareText } from "lucide-react";

export default function UserReportedIssue({ problem }) {
  if (!problem) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <MessageSquareText className="text-blue-500 mt-0.5 shrink-0" size={20} />
        <div>
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">
            User Reported Issue
          </p>
          <p className="text-sm text-gray-700 mt-1">{problem}</p>
        </div>
      </div>
    </div>
  );
}
