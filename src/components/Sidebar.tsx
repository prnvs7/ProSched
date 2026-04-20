import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Cog, Users, CalendarClock, FileBarChart, LogOut, Factory, Menu, X } from "lucide-react";
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
  const [open, setOpen] = useState(false);

  const handleLogout = async () => { await signOut(); navigate("/login"); };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg text-white"
        style={{ background: "hsl(var(--sidebar-bg))" }}
        aria-label="Toggle navigation"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-40 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{ background: "var(--gradient-navy)", color: "hsl(var(--sidebar-fg))" }}
      >
        <div className="px-6 py-6 flex items-center gap-2.5 border-b border-white/10">
          <Factory className="text-[hsl(var(--accent))]" size={26} />
          <h1 className="text-xl font-extrabold tracking-tight text-white">ProSched</h1>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 ${
                  isActive ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-lg" : "text-white/85"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          {role && (
            <div className="text-xs text-white/60 px-1">
              Signed in as <span className="text-[hsl(var(--accent))] font-semibold capitalize">{role}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/85 hover:bg-white/10 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {open && <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setOpen(false)} />}
    </>
  );
}
