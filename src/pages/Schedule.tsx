import { useEffect, useState } from "react";
import { Zap, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SkeletonTable from "@/components/SkeletonTable";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { differenceInDays, format } from "date-fns";

type Order = { id: string; product_name: string; quantity: number; priority: "high" | "medium" | "low"; deadline: string; status: "pending" | "in-progress" | "completed"; assigned_machine_id: string | null };
type Machine = { id: string; machine_name: string; status: "available" | "busy"; current_order_id: string | null };

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };
const PRIORITY_GRADIENT: Record<string, string> = {
  high: "linear-gradient(90deg, #ef4444, #ec4899)",
  medium: "linear-gradient(90deg, #f97316, #eab308)",
  low: "linear-gradient(90deg, #10b981, #06b6d4)",
};

export default function Schedule() {
  const { isManager } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    const [o, m] = await Promise.all([
      api.get("/orders"),
      api.get("/machines"),
    ]);
    setOrders(o ?? []);
    setMachines(m ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const autoSchedule = async () => {
    setRunning(true);
    try {
      const pending = orders
        .filter((o) => o.status === "pending")
        .sort((a, b) => {
          const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
          return p !== 0 ? p : a.deadline.localeCompare(b.deadline);
        });
      const available = machines.filter((m) => m.status === "available");

      if (pending.length === 0) { toast.info("No pending orders to schedule"); return; }
      if (available.length === 0) { toast.error("No available machines"); return; }

      const pairs = pending.slice(0, available.length).map((o, i) => ({ order: o, machine: available[i] }));

      for (const { order, machine } of pairs) {
        await api.put(`/orders/${order.id}`, { status: "in-progress", assigned_machine_id: machine.id });
        await api.put(`/machines/${machine.id}`, { status: "busy", current_order_id: order.id });
      }
      toast.success(`⚡ Scheduled ${pairs.length} order${pairs.length > 1 ? "s" : ""}`);
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Scheduling failed");
    } finally {
      setRunning(false);
    }
  };

  const scheduled = orders.filter((o) => o.status === "in-progress" && o.assigned_machine_id);
  const machineName = (id: string | null) => machines.find((m) => m.id === id)?.machine_name ?? "—";

  const today = new Date();
  const maxDays = Math.max(1, ...scheduled.map((o) => Math.max(1, differenceInDays(new Date(o.deadline), today))));
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const availableCount = machines.filter((m) => m.status === "available").length;

  return (
    <div>
      <PageHeader
        title="Schedule"
        subtitle="Auto-assign pending orders to available machines"
        action={isManager && (
          <button onClick={autoSchedule} disabled={running} className="btn-primary">
            {running ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
            Auto Schedule
          </button>
        )}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>Pending Orders</div>
          <div className="text-3xl font-extrabold mt-1.5" style={{ color: "rgba(255,255,255,0.95)" }}>{pendingCount}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>Available Machines</div>
          <div className="text-3xl font-extrabold mt-1.5" style={{ color: "rgba(255,255,255,0.95)" }}>{availableCount}</div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="stat-card !p-0 overflow-hidden mb-6" style={{ cursor: "default" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>Current Assignments</h3>
        </div>
        {loading ? <div className="p-4"><SkeletonTable cols={4} /></div> : scheduled.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "rgba(255,255,255,0.35)" }}>No active assignments. Click <strong style={{ color: "#a78bfa" }}>Auto Schedule</strong> to begin.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead><tr><th>Order</th><th>Machine</th><th>Priority</th><th>Deadline</th></tr></thead>
              <tbody>
                {scheduled.map((o, i) => (
                  <tr key={o.id} className="table-row-anim" style={{ animationDelay: `${i * 40}ms` }}>
                    <td className="font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{o.product_name}</td>
                    <td style={{ color: "rgba(255,255,255,0.6)" }}>{machineName(o.assigned_machine_id)}</td>
                    <td><span className={`badge badge-${o.priority}`}>{o.priority}</span></td>
                    <td style={{ color: "rgba(255,255,255,0.5)" }}>{format(new Date(o.deadline), "MMM d, yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Timeline View */}
      <div className="stat-card" style={{ cursor: "default" }}>
        <h3 className="text-sm font-semibold mb-5" style={{ color: "rgba(255,255,255,0.8)" }}>Timeline View</h3>
        {scheduled.length === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: "rgba(255,255,255,0.35)" }}>No timeline data.</p>
        ) : (
          <div className="space-y-4">
            {scheduled.map((o, i) => {
              const days = Math.max(1, differenceInDays(new Date(o.deadline), today));
              const widthPct = Math.min(100, Math.max(12, (days / maxDays) * 100));
              return (
                <div key={o.id} className="table-row-anim" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
                      {o.product_name} <span style={{ color: "rgba(255,255,255,0.35)" }}>→ {machineName(o.assigned_machine_id)}</span>
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>{days}d to deadline</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${widthPct}%`, background: PRIORITY_GRADIENT[o.priority] }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
