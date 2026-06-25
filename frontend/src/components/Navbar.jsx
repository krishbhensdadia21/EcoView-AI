import { Link, useLocation } from "react-router-dom";
import { Leaf, ScanLine, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { pathname } = useLocation();

  const links = [
    { to: "/",          label: "Home",      icon: <Leaf size={16} /> },
    { to: "/scan",      label: "Scan",      icon: <ScanLine size={16} /> },
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-green-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 text-green-700 font-bold text-xl">
          <Leaf className="text-green-500" size={24} />
          EcoView AI
        </Link>

        {/* Nav links */}
        <div className="flex gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center gap-1 text-sm font-medium transition-colors
                ${pathname === l.to
                  ? "text-green-600 border-b-2 border-green-500 pb-0.5"
                  : "text-gray-500 hover:text-green-600"
                }`}
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}