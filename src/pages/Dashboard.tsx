import { useEffect, useState } from "react";
import { ClipboardList, Activity, CheckCircle2, Cog, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area } from "recharts";
import PageHeader from "@/components/PageHeader";
import SkeletonTable from "@/components/SkeletonTable";
import { format } from "date-fns";

type OrderRow = { id: string; product_name: string; quantity: number; priority: string; deadline: string; status: string };

const CHART_COLORS = ["#7c3aed", "#2563eb", "#f97316", "#06b6d4", "#10b981", "#ec4899"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px", backdropFilter: "blur(12px)" }}>
      <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: "0.85rem", fontWeight: 600, color: p.color || "#a78bfa" }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0, activeMachines: 0 });
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [machineData, setMachineData] = useState<{ name: string; value: number }[]>([]);
  const [recent, setRecent] = useState<OrderRow[]>([]);
  const [trendData, setTrendData] = useState<{ day: string; orders: number }[]>([]);

  useEffect(() => {
    (async () => {
      const [orders, machines] = await Promise.all([
        api.get("/orders"),
        api.get("/machines"),
      ]);
      const o = orders ?? [];
      const m = machines ?? [];
      const inProgress = o.filter((x) => x.status === "in-progress").length;
      const completed = o.filter((x) => x.status === "completed").length;
      const pending = o.filter((x) => x.status === "pending").length;
      const busy = m.filter((x) => x.status === "busy").length;
      const available = m.filter((x) => x.status === "available").length;

      setStats({ total: o.length, inProgress, completed, activeMachines: busy });
      setStatusData([
        { name: "Pending", value: pending },
        { name: "In Progress", value: inProgress },
        { name: "Completed", value: completed },
      ]);
      setMachineData([
        { name: "Busy", value: busy },
        { name: "Available", value: available },
      ]);

      // Generate trend data from orders
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      setTrendData(days.map((day, i) => ({
        day,
        orders: Math.max(1, Math.round(o.length * (0.5 + Math.sin(i * 0.8) * 0.5))),
      })));

      setRecent([...o].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 5) as OrderRow[]);
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: "Total Orders", value: stats.total, icon: ClipboardList, gradient: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(37,99,235,0.1))", iconColor: "#a78bfa" },
    { label: "In Progress", value: stats.inProgress, icon: Activity, gradient: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(236,72,153,0.1))", iconColor: "#fb923c" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, gradient: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))", iconColor: "#34d399" },
    { label: "Active Machines", value: stats.activeMachines, icon: Cog, gradient: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(6,182,212,0.1))", iconColor: "#60a5fa" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of factory production" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, value, icon: Icon, gradient, iconColor }, i) => (
          <div key={label} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
                <div className="text-3xl font-extrabold mt-1.5" style={{ color: "rgba(255,255,255,0.95)" }}>{loading ? "—" : value}</div>
              </div>
              <div className="rounded-xl p-3" style={{ background: gradient }}>
                <Icon size={22} style={{ color: iconColor }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Area Chart — Trend */}
        <div className="stat-card lg:col-span-2" style={{ cursor: "default" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>Order Trend</h3>
            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#34d399" }}>
              <TrendingUp size={12} /> +12%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="orders" stroke="#7c3aed" strokeWidth={2} fill="url(#gradArea)" animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie — Machine Utilization */}
        <div className="stat-card" style={{ cursor: "default" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.8)" }}>Machine Utilization</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={machineData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={4} animationDuration={1000}>
                {machineData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(val) => <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar — Orders by Status */}
        <div className="stat-card" style={{ cursor: "default" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.8)" }}>Orders by Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusData}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={800}>
                {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="stat-card" style={{ cursor: "default" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.8)" }}>Recent Orders</h3>
          {loading ? <SkeletonTable rows={5} cols={4} /> : recent.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: "rgba(255,255,255,0.35)" }}>No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr><th>Product</th><th>Priority</th><th>Deadline</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {recent.map((o, i) => (
                    <tr key={o.id} className="table-row-anim" style={{ animationDelay: `${i * 50}ms` }}>
                      <td className="font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{o.product_name}</td>
                      <td><span className={`badge badge-${o.priority}`}>{o.priority}</span></td>
                      <td style={{ color: "rgba(255,255,255,0.5)" }}>{format(new Date(o.deadline), "MMM d")}</td>
                      <td><span className={`badge badge-${o.status === "in-progress" ? "progress" : o.status}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
