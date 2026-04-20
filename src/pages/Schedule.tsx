import { useEffect, useState } from "react";
import { Zap, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SkeletonTable from "@/components/SkeletonTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { differenceInDays, format } from "date-fns";

type Order = { id: string; product_name: string; quantity: number; priority: "high" | "medium" | "low"; deadline: string; status: "pending" | "in-progress" | "completed"; assigned_machine_id: string | null };
type Machine = { id: string; machine_name: string; status: "available" | "busy"; current_order_id: string | null };

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default function Schedule() {
  const { isManager } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: o }, { data: m }] = await Promise.all([
      supabase.from("orders").select("*"),
      supabase.from("machines").select("*"),
    ]);
    setOrders((o as Order[]) ?? []);
    setMachines((m as Machine[]) ?? []);
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
        await supabase.from("orders").update({ status: "in-progress", assigned_machine_id: machine.id }).eq("id", order.id);
        await supabase.from("machines").update({ status: "busy", current_order_id: order.id }).eq("id", machine.id);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Pending Orders</div>
          <div className="text-3xl font-bold text-foreground mt-1.5">{orders.filter((o) => o.status === "pending").length}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Available Machines</div>
          <div className="text-3xl font-bold text-foreground mt-1.5">{machines.filter((m) => m.status === "available").length}</div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <h3 className="text-sm font-semibold text-foreground mb-4">Current Assignments</h3>
        {loading ? <SkeletonTable cols={4} /> : scheduled.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No active assignments. Click <strong>Auto Schedule</strong> to begin.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4">Order</th><th className="py-2 pr-4">Machine</th><th className="py-2 pr-4">Priority</th><th className="py-2">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {scheduled.map((o, i) => (
                  <tr key={o.id} className="border-b border-border last:border-0 table-row-anim" style={{ animationDelay: `${i * 40}ms` }}>
                    <td className="py-3 pr-4 font-medium text-foreground">{o.product_name}</td>
                    <td className="py-3 pr-4">{machineName(o.assigned_machine_id)}</td>
                    <td className="py-3 pr-4"><span className={`badge badge-${o.priority}`}>{o.priority}</span></td>
                    <td className="py-3">{format(new Date(o.deadline), "MMM d, yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <h3 className="text-sm font-semibold text-foreground mb-4">Timeline View</h3>
        {scheduled.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No timeline data.</p>
        ) : (
          <div className="space-y-3">
            {scheduled.map((o, i) => {
              const days = Math.max(1, differenceInDays(new Date(o.deadline), today));
              const widthPct = Math.min(100, Math.max(8, (days / maxDays) * 100));
              const color = o.priority === "high" ? "hsl(0 75% 55%)" : o.priority === "medium" ? "hsl(38 92% 50%)" : "hsl(145 63% 42%)";
              return (
                <div key={o.id} className="table-row-anim" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-foreground">{o.product_name} <span className="text-muted-foreground">→ {machineName(o.assigned_machine_id)}</span></span>
                    <span className="text-muted-foreground">{days}d to deadline</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${widthPct}%`, background: color }} />
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
