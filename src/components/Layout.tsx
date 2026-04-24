import { Outlet, useLocation } from "react-router-dom";
import { Bell, Search, User } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/lib/auth";

export default function Layout() {
  const location = useLocation();
  const { user, role } = useAuth();

  const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/orders": "Orders",
    "/machines": "Machines",
    "/workers": "Workers",
    "/schedule": "Schedule",
    "/reports": "Reports",
  };

  const currentTitle = pageTitles[location.pathname] || "ProSched";

  return (
    <div className="min-h-screen" style={{ background: "hsl(225 25% 7%)" }}>
      <Sidebar />
      <main className="lg:ml-64 min-h-screen flex flex-col transition-all duration-300">
        {/* Top Navbar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-page-label">{currentTitle}</div>
          </div>
          <div className="topbar-right">
            <button className="topbar-icon-btn" title="Search">
              <Search size={18} />
            </button>
            <button className="topbar-icon-btn topbar-notif" title="Notifications">
              <Bell size={18} />
              <span className="topbar-notif-dot" />
            </button>
            <div className="topbar-divider" />
            <div className="topbar-profile">
              <div className="topbar-avatar">
                <User size={16} />
              </div>
              <div className="topbar-user-info">
                <div className="topbar-user-email">{user?.email?.split("@")[0] || "User"}</div>
                <div className="topbar-user-role">{role || "Member"}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div key={location.pathname} className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pt-4 animate-fade-in">
          <Outlet />
        </div>

        <footer className="px-6 py-3 text-center text-xs border-t" style={{ color: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.05)" }}>
          ProSched © {new Date().getFullYear()} — Production Management System
        </footer>
      </main>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          height: 64px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,10,26,0.6);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .topbar-left { display: flex; align-items: center; gap: 1rem; }
        .topbar-page-label {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.35);
        }
        .topbar-right { display: flex; align-items: center; gap: 0.5rem; }
        .topbar-icon-btn {
          width: 36px; height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: rgba(255,255,255,0.45);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .topbar-icon-btn:hover {
          color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.06);
        }
        .topbar-notif { position: relative; }
        .topbar-notif-dot {
          position: absolute;
          top: 7px; right: 7px;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #7c3aed;
          border: 2px solid hsl(225 25% 7%);
        }
        .topbar-divider {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,0.08);
          margin: 0 0.5rem;
        }
        .topbar-profile {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.3rem 0.6rem 0.3rem 0.3rem;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .topbar-profile:hover { background: rgba(255,255,255,0.04); }
        .topbar-avatar {
          width: 32px; height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(124,58,237,0.25), rgba(37,99,235,0.2));
          color: #a78bfa;
        }
        .topbar-user-info { display: flex; flex-direction: column; }
        .topbar-user-email { font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.85); text-transform: capitalize; }
        .topbar-user-role { font-size: 0.68rem; color: rgba(255,255,255,0.35); text-transform: capitalize; }

        @media (max-width: 768px) {
          .topbar { padding: 0 1rem; padding-left: 3.5rem; }
          .topbar-user-info { display: none; }
        }
      `}</style>
    </div>
  );
}
