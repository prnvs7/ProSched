import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Cog, Users, CalendarClock, FileBarChart, LogOut, Factory, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/machines", label: "Machines", icon: Cog },
  { to: "/workers", label: "Workers", icon: Users },
  { to: "/schedule", label: "Schedule", icon: CalendarClock },
  { to: "/reports", label: "Reports", icon: FileBarChart },
];

export default function Sidebar() {
  const { signOut, role } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => { await signOut(); navigate("/login"); };

  const sidebarWidth = collapsed ? "w-[72px]" : "w-64";

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl text-white/90 transition-all duration-200"
        style={{ background: "rgba(124,58,237,0.2)", backdropFilter: "blur(12px)", border: "1px solid rgba(124,58,237,0.3)" }}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`sidebar-root fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 ${sidebarWidth}`}
      >
        {/* Logo */}
        <div className={`sidebar-logo ${collapsed ? "justify-center px-3" : "px-5"}`}>
          <div className="sidebar-logo-inner">
            <div className="sidebar-logo-icon">
              <Factory size={22} />
            </div>
            {!collapsed && <span className="sidebar-logo-text">ProSched</span>}
          </div>
        </div>

        {/* Nav */}
        <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${collapsed ? "px-2" : "px-3"}`}>
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : ""} ${collapsed ? "sidebar-link-collapsed" : ""}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="sidebar-link-icon" />
              {!collapsed && <span>{label}</span>}
              {/* Active indicator */}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">
          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-collapse-btn hidden lg:flex"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span>Collapse</span>}
          </button>

          {!collapsed && role && (
            <div className="sidebar-role">
              Signed in as <span className="sidebar-role-highlight">{role}</span>
            </div>
          )}

          <button onClick={handleLogout} className={`sidebar-logout ${collapsed ? "sidebar-link-collapsed" : ""}`}>
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30" onClick={() => setMobileOpen(false)} />}

      <style>{`
        .sidebar-root {
          background: linear-gradient(180deg, rgba(10,10,26,0.98), rgba(15,12,30,0.98));
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          height: 64px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: all 0.3s;
        }
        .sidebar-logo-inner {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .sidebar-logo-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.15));
          color: #a78bfa;
          flex-shrink: 0;
        }
        .sidebar-logo-text {
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #a78bfa, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.85rem;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          transition: all 0.25s ease;
          position: relative;
          text-decoration: none;
        }
        .sidebar-link:hover {
          color: rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.05);
        }
        .sidebar-link-active {
          color: white !important;
          background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.12)) !important;
          box-shadow: 0 0 20px rgba(124,58,237,0.1);
        }
        .sidebar-link-active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 25%;
          height: 50%;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: linear-gradient(to bottom, #7c3aed, #2563eb);
        }
        .sidebar-link-active .sidebar-link-icon { color: #a78bfa; }
        .sidebar-link-collapsed {
          justify-content: center;
          padding: 0.7rem;
        }

        .sidebar-bottom {
          padding: 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .sidebar-collapse-btn {
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sidebar-collapse-btn:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.04); }
        .sidebar-role {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.35);
          padding: 0 0.5rem;
        }
        .sidebar-role-highlight {
          color: #a78bfa;
          font-weight: 600;
          text-transform: capitalize;
        }
        .sidebar-logout {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.85rem;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          text-align: left;
        }
        .sidebar-logout:hover { color: #f87171; background: rgba(239,68,68,0.08); }
      `}</style>
    </>
  );
}
