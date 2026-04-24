import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import SkeletonTable from "@/components/SkeletonTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";

type Order = {
  id: string; product_name: string; quantity: number;
  priority: "high" | "medium" | "low";
  deadline: string;
  status: "pending" | "in-progress" | "completed";
  assigned_machine_id: string | null;
};

const empty: Omit<Order, "id"> = { product_name: "", quantity: 1, priority: "medium", deadline: new Date().toISOString().slice(0, 10), status: "pending", assigned_machine_id: null };

export default function Orders() {
  const { isManager } = useAuth();
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState(empty);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [confirm, setConfirm] = useState<Order | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Order[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (o: Order) => {
    setEditing(o);
    setForm({ product_name: o.product_name, quantity: o.quantity, priority: o.priority, deadline: o.deadline, status: o.status, assigned_machine_id: o.assigned_machine_id });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const { error } = await supabase.from("orders").update(form).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Order updated");
    } else {
      const { error } = await supabase.from("orders").insert(form);
      if (error) return toast.error(error.message);
      toast.success("Order created");
    }
    setModal(false);
    load();
  };

  const remove = async () => {
    if (!confirm) return;
    const { error } = await supabase.from("orders").delete().eq("id", confirm.id);
    if (error) return toast.error(error.message);
    toast.success("Order deleted");
    setConfirm(null);
    load();
  };

  const filtered = rows.filter((r) => (filterStatus === "all" || r.status === filterStatus) && (filterPriority === "all" || r.priority === filterPriority));

  const statusFilters = ["all", "pending", "in-progress", "completed"];
  const priorityFilters = ["all", "high", "medium", "low"];

  return (
    <div>
      <PageHeader
        title="Production Orders"
        subtitle="Manage all production orders and priorities"
        action={isManager && <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Order</button>}
      />

      {/* Filters */}
      <div className="stat-card mb-4 !p-4" style={{ cursor: "default" }}>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>Status</label>
            <div className="flex gap-1.5">
              {statusFilters.map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 capitalize"
                  style={{
                    background: filterStatus === s ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${filterStatus === s ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.06)"}`,
                    color: filterStatus === s ? "#a78bfa" : "rgba(255,255,255,0.5)",
                  }}
                >{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>Priority</label>
            <div className="flex gap-1.5">
              {priorityFilters.map((p) => (
                <button key={p} onClick={() => setFilterPriority(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 capitalize"
                  style={{
                    background: filterPriority === p ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${filterPriority === p ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.06)"}`,
                    color: filterPriority === p ? "#a78bfa" : "rgba(255,255,255,0.5)",
                  }}
                >{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="stat-card !p-0 overflow-hidden" style={{ cursor: "default" }}>
        {loading ? <div className="p-4"><SkeletonTable cols={7} /></div> : filtered.length === 0 ? (
          <p className="p-10 text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>No orders match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Order ID</th><th>Product</th><th>Qty</th>
                  <th>Priority</th><th>Deadline</th><th>Status</th>
                  {isManager && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => (
                  <tr key={o.id} className="table-row-anim" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{o.id.slice(0, 8)}</td>
                    <td className="font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{o.product_name}</td>
                    <td style={{ color: "rgba(255,255,255,0.6)" }}>{o.quantity}</td>
                    <td><span className={`badge badge-${o.priority}`}>{o.priority}</span></td>
                    <td style={{ color: "rgba(255,255,255,0.5)" }}>{format(new Date(o.deadline), "MMM d, yyyy")}</td>
                    <td><span className={`badge badge-${o.status === "in-progress" ? "progress" : o.status}`}>{o.status}</span></td>
                    {isManager && (
                      <td className="text-right">
                        <div className="inline-flex gap-1.5">
                          <button onClick={() => openEdit(o)} className="p-1.5 rounded-lg transition-all duration-200" style={{ color: "rgba(255,255,255,0.4)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setConfirm(o)} className="p-1.5 rounded-lg transition-all duration-200" style={{ color: "rgba(239,68,68,0.6)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#f87171"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(239,68,68,0.6)"; }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Order" : "Add New Order"}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Product Name</label>
            <input required value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Quantity</label>
              <input type="number" min={1} required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Deadline</label>
              <input type="date" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })} className="input-field">
                <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="input-field">
                <option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? "Save Changes" : "Create Order"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Delete Order">
        <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>Delete order <strong style={{ color: "rgba(255,255,255,0.9)" }}>{confirm?.product_name}</strong>? This cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setConfirm(null)} className="btn-ghost">Cancel</button>
          <button onClick={remove} className="btn-danger px-4 py-2.5">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
