import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import SkeletonTable from "@/components/SkeletonTable";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

type Machine = { id: string; machine_name: string; capacity: number; status: "available" | "busy"; current_order_id: string | null };
type Order = { id: string; product_name: string };

type MachineForm = { machine_name: string; capacity: number; status: "available" | "busy"; current_order_id: string | null };
const empty: MachineForm = { machine_name: "", capacity: 1, status: "available", current_order_id: null };

export default function Machines() {
  const { isManager } = useAuth();
  const [rows, setRows] = useState<Machine[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Machine | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Machine | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [m, o] = await Promise.all([
        api.get("/machines"),
        api.get("/orders"),
      ]);
      setRows(m ?? []);
      setOrders(o ?? []);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const orderName = (id: string | null) => orders.find((x) => x.id === id)?.product_name ?? "—";

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (m: Machine) => {
    setEditing(m);
    setForm({ machine_name: m.machine_name, capacity: m.capacity, status: m.status, current_order_id: m.current_order_id });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, current_order_id: form.current_order_id || null };
    try {
      if (editing) {
        await api.put(`/machines/${editing.id}`, payload);
        toast.success("Machine updated");
      } else {
        await api.post("/machines", payload);
        toast.success("Machine added");
      }
    } catch (err: any) {
      return toast.error(err.message);
    }
    setModal(false); load();
  };

  const remove = async () => {
    if (!confirm) return;
    try {
      await api.delete(`/machines/${confirm.id}`);
      toast.success("Machine deleted"); setConfirm(null); load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader title="Machines" subtitle="Manage factory equipment and capacity"
        action={isManager && <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Machine</button>} />

      <div className="stat-card !p-0 overflow-hidden" style={{ cursor: "default" }}>
        {loading ? <div className="p-4"><SkeletonTable cols={5} /></div> : rows.length === 0 ? (
          <p className="p-10 text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>No machines yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Machine ID</th><th>Name</th><th>Capacity</th>
                  <th>Status</th><th>Current Order</th>
                  {isManager && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((m, i) => (
                  <tr key={m.id} className="table-row-anim" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{m.id.slice(0, 8)}</td>
                    <td className="font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{m.machine_name}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, m.capacity * 10)}%`, background: "linear-gradient(90deg, #7c3aed, #2563eb)" }} />
                        </div>
                        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>{m.capacity}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${m.status}`}>
                        {m.status === "busy" && <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" style={{ background: "#fb923c" }} />}
                        {m.status}
                      </span>
                    </td>
                    <td style={{ color: "rgba(255,255,255,0.4)" }}>{orderName(m.current_order_id)}</td>
                    {isManager && (
                      <td className="text-right">
                        <div className="inline-flex gap-1.5">
                          <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg transition-all duration-200" style={{ color: "rgba(255,255,255,0.4)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setConfirm(m)} className="p-1.5 rounded-lg transition-all duration-200" style={{ color: "rgba(239,68,68,0.6)" }}
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

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Machine" : "Add Machine"}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Machine Name</label>
            <input required value={form.machine_name} onChange={(e) => setForm({ ...form, machine_name: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Capacity</label>
              <input type="number" min={1} required value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="input-field">
                <option value="available">Available</option><option value="busy">Busy</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Current Order (optional)</label>
            <select value={form.current_order_id ?? ""} onChange={(e) => setForm({ ...form, current_order_id: e.target.value || null })} className="input-field">
              <option value="">None</option>
              {orders.map((o) => <option key={o.id} value={o.id}>{o.product_name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? "Save Changes" : "Add Machine"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Delete Machine">
        <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>Delete machine <strong style={{ color: "rgba(255,255,255,0.9)" }}>{confirm?.machine_name}</strong>?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setConfirm(null)} className="btn-ghost">Cancel</button>
          <button onClick={remove} className="btn-danger px-4 py-2.5">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
