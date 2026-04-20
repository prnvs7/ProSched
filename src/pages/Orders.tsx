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

  return (
    <div>
      <PageHeader
        title="Production Orders"
        subtitle="Manage all production orders and priorities"
        action={isManager && <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Order</button>}
      />

      <div className="bg-card rounded-xl border border-border p-4 mb-4 flex flex-wrap gap-3" style={{ boxShadow: "var(--shadow-card)" }}>
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-40">
            <option value="all">All</option><option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Priority</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="input-field w-40">
            <option value="all">All</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        {loading ? <div className="p-4"><SkeletonTable cols={7} /></div> : filtered.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No orders match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Order ID</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Priority</th><th className="px-4 py-3">Deadline</th><th className="px-4 py-3">Status</th>
                  {isManager && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => (
                  <tr key={o.id} className="border-t border-border table-row-anim hover:bg-secondary/30 transition-colors" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{o.product_name}</td>
                    <td className="px-4 py-3">{o.quantity}</td>
                    <td className="px-4 py-3"><span className={`badge badge-${o.priority}`}>{o.priority}</span></td>
                    <td className="px-4 py-3">{format(new Date(o.deadline), "MMM d, yyyy")}</td>
                    <td className="px-4 py-3"><span className={`badge badge-${o.status === "in-progress" ? "progress" : o.status}`}>{o.status}</span></td>
                    {isManager && (
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button onClick={() => openEdit(o)} className="p-1.5 rounded-md hover:bg-secondary transition-colors" aria-label="Edit"><Pencil size={15} /></button>
                          <button onClick={() => setConfirm(o)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors" aria-label="Delete"><Trash2 size={15} /></button>
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
            <label className="block text-xs font-semibold mb-1.5">Product Name</label>
            <input required value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Quantity</label>
              <input type="number" min={1} required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Deadline</label>
              <input type="date" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })} className="input-field">
                <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Status</label>
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
        <p className="text-sm text-muted-foreground mb-5">Delete order <strong className="text-foreground">{confirm?.product_name}</strong>? This cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setConfirm(null)} className="btn-ghost">Cancel</button>
          <button onClick={remove} className="btn-danger px-4 py-2.5">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
