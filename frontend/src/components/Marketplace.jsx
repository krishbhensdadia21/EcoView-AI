import { MapPin, Phone, Tag } from "lucide-react";

const TYPE_COLOURS = {
  NGO:         "bg-purple-100 text-purple-700",
  School:      "bg-blue-100   text-blue-700",
  Refurbisher: "bg-yellow-100 text-yellow-700",
  Recycler:    "bg-green-100  text-green-700",
};

export default function Marketplace({ partners = [] }) {
  if (!partners.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover">
      <h3 className="font-semibold text-gray-800 text-lg mb-5">
        🤝 Matched Partners Near You
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {partners.map((p, i) => (
          <div key={i}
               className="border border-gray-100 rounded-xl p-4
                          hover:shadow-sm transition-shadow">
            {/* Type badge */}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                              ${TYPE_COLOURS[p.type] || "bg-gray-100 text-gray-600"}`}>
              {p.type}
            </span>

            <p className="font-semibold text-gray-800 mt-2">{p.name}</p>

            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <MapPin size={12} /> {p.location}
              {p.distance_km && ` · ${p.distance_km} km away`}
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <Phone size={12} /> {p.contact}
            </div>

            {p.accepts && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Tag size={12} /> {p.accepts}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}