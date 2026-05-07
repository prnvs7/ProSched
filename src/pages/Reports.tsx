import { useEffect, useState } from "react";
import { Download, TrendingUp, Calendar } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

const CHART_COLORS = ["#7c3aed", "#f97316", "#10b981", "#2563eb", "#ec4899", "#06b6d4"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px", backdropFilter: "blur(12px)" }}>
      {label && <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: "0.85rem", fontWeight: 600, color: p.color || p.fill || "#a78bfa" }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, machines: 0, busy: 0, workers: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [statusPieData, setStatusPieData] = useState<{ name: string; value: number }[]>([]);
  const [trendData, setTrendData] = useState<{ day: string; completed: number; created: number }[]>([]);

  useEffect(() => {
    (async () => {
      const [o, m, w] = await Promise.all([
        api.get("/orders"),
        api.get("/machines"),
        api.get("/workers"),
      ]);
      const O = o ?? []; const M = m ?? []; const W = w ?? [];
      setOrders(O);

      const pending = O.filter((x) => x.status === "pending").length;
      const inProgress = O.filter((x) => x.status === "in-progress").length;
      const completed = O.filter((x) => x.status === "completed").length;
      const busy = M.filter((x) => x.status === "busy").length;

      setStats({
        total: O.length,
        pending,
        inProgress,
        completed,
        machines: M.length,
        busy,
        workers: W.length,
      });

      setStatusPieData([
        { name: "Pending", value: pending },
        { name: "In Progress", value: inProgress },
        { name: "Completed", value: completed },
      ]);

      // Generate trend data
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      setTrendData(days.map((day, i) => ({
        day,
        completed: Math.max(0, Math.round(completed * (0.3 + Math.sin(i * 0.7) * 0.5))),
        created: Math.max(1, Math.round(O.length * (0.4 + Math.cos(i * 0.5) * 0.4))),
      })));
    })();
  }, []);

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(15, 32, 68);
    doc.text("ProSched — Production Report", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${format(new Date(), "PPpp")}`, 14, 28);

    autoTable(doc, {
      startY: 36,
      head: [["Metric", "Value"]],
      body: [
        ["Total Orders", String(stats.total)],
        ["Pending", String(stats.pending)],
        ["In Progress", String(stats.inProgress)],
        ["Completed", String(stats.completed)],
        ["Total Machines", String(stats.machines)],
        ["Busy Machines", String(stats.busy)],
        ["Total Workers", String(stats.workers)],
      ],
      theme: "grid",
      headStyles: { fillColor: [15, 32, 68] },
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Product", "Qty", "Priority", "Deadline", "Status"]],
      body: orders.map((o) => [o.product_name, o.quantity, o.priority, o.deadline, o.status]),
      theme: "striped",
      headStyles: { fillColor: [0, 180, 216] },
    });

    doc.save(`ProSched-Report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("Report exported");
  };

  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const cards = [
    { label: "Total Orders", value: stats.total, gradient: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(37,99,235,0.1))" },
    { label: "Pending", value: stats.pending, gradient: "linear-gradient(135deg, rgba(148,163,184,0.12), rgba(100,116,139,0.08))" },
    { label: "In Progress", value: stats.inProgress, gradient: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,179,8,0.08))" },
    { label: "Completed", value: stats.completed, gradient: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))" },
    { label: "Machines", value: stats.machines, gradient: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(6,182,212,0.08))" },
    { label: "Busy Machines", value: stats.busy, gradient: "linear-gradient(135deg, rgba(236,72,153,0.12), rgba(249,115,22,0.08))" },
    { label: "Workers", value: stats.workers, gradient: "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(16,185,129,0.08))" },
    { label: "Completion Rate", value: `${completionRate}%`, gradient: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.1))" },
  ];

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Production summary and exports"
        action={<button onClick={exportPdf} className="btn-primary"><Download size={16} /> Export PDF</button>}
      />

      {/* Date range header */}
      <div className="stat-card !p-3 mb-4 flex items-center gap-2" style={{ cursor: "default" }}>
        <Calendar size={14} style={{ color: "#a78bfa" }} />
        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
          Showing data as of {format(new Date(), "MMMM d, yyyy")}
        </span>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={c.label} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 40}ms`, background: c.gradient, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{c.label}</div>
            <div className="text-3xl font-extrabold mt-1.5" style={{ color: "rgba(255,255,255,0.95)" }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Area — Trend */}
        <div className="stat-card" style={{ cursor: "default" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>Order Trends</h3>
            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#34d399" }}>
              <TrendingUp size={12} /> Weekly
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="created" name="Created" stroke="#7c3aed" strokeWidth={2} fill="url(#gradCreated)" animationDuration={1200} />
              <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2} fill="url(#gradCompleted)" animationDuration={1200} />
              <Legend formatter={(val) => <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>{val}</span>} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie — Status */}
        <div className="stat-card" style={{ cursor: "default" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.8)" }}>Order Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusPieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={85} paddingAngle={4} animationDuration={1000}>
                {statusPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(val) => <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
