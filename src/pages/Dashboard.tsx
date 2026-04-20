import { useEffect, useState } from "react";
import { ClipboardList, Activity, CheckCircle2, Cog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import PageHeader from "@/components/PageHeader";
import SkeletonTable from "@/components/SkeletonTable";
import { format } from "date-fns";

type OrderRow = { id: string; product_name: string; quantity: number; priority: string; deadline: string; status: string };

const COLORS = ["hsl(192 100% 42%)", "hsl(220 64% 16%)", "hsl(38 92% 50%)", "hsl(145 63% 42%)"];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0, activeMachines: 0 });
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [machineData, setMachineData] = useState<{ name: string; value: number }[]>([]);
  const [recent, setRecent] = useState<OrderRow[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: orders }, { data: machines }] = await Promise.all([
        supabase.from("orders").select("*"),
        supabase.from("machines").select("*"),
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
      setRecent([...o].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 5) as OrderRow[]);
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: "Total Orders", value: stats.total, icon: ClipboardList, color: "hsl(192 100% 42%)" },
    { label: "In Progress", value: stats.inProgress, icon: Activity, color: "hsl(38 92% 50%)" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "hsl(145 63% 42%)" },
    { label: "Active Machines", value: stats.activeMachines, icon: Cog, color: "hsl(220 64% 16%)" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of factory production" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
                <div className="text-3xl font-bold text-foreground mt-1.5">{loading ? "—" : value}</div>
              </div>
              <div className="rounded-xl p-3" style={{ background: `${color}1A`, color }}>
                <Icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-5 border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="value" fill="hsl(192 100% 42%)" radius={[6, 6, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Machine Utilization</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={machineData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} animationDuration={800}>
                {machineData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Orders</h3>
        {loading ? <SkeletonTable rows={5} cols={5} /> : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No orders yet. Add some from the Orders page.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4">Product</th><th className="py-2 pr-4">Qty</th><th className="py-2 pr-4">Priority</th><th className="py-2 pr-4">Deadline</th><th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o, i) => (
                  <tr key={o.id} className="border-b border-border last:border-0 table-row-anim" style={{ animationDelay: `${i * 50}ms` }}>
                    <td className="py-3 pr-4 font-medium text-foreground">{o.product_name}</td>
                    <td className="py-3 pr-4">{o.quantity}</td>
                    <td className="py-3 pr-4"><span className={`badge badge-${o.priority}`}>{o.priority}</span></td>
                    <td className="py-3 pr-4">{format(new Date(o.deadline), "MMM d, yyyy")}</td>
                    <td className="py-3"><span className={`badge badge-${o.status === "in-progress" ? "progress" : o.status}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
