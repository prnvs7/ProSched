import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import SkeletonTable from "@/components/SkeletonTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

type Worker = { id: string; employee_name: string; skill: string; shift: "morning" | "evening" | "night"; assigned_machine_id: string | null; is_available: boolean };
type Machine = { id: string; machine_name: string };

type WorkerForm = { employee_name: string; skill: string; shift: "morning" | "evening" | "night"; assigned_machine_id: string | null; is_available: boolean };
const empty: WorkerForm = { employee_name: "", skill: "", shift: "morning", assigned_machine_id: null, is_available: true };

const SHIFT_COLORS: Record<string, { bg: string; color: string }> = {
  morning: { bg: "rgba(6,182,212,0.12)", color: "#22d3ee" },
  evening: { bg: "rgba(249,115,22,0.12)", color: "#fb923c" },
  night: { bg: "rgba(124,58,237,0.12)", color: "#a78bfa" },
};

export default function Workers() {
  const { isManager } = useAuth();
  const [rows, setRows] = useState<Worker[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Worker | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: w }, { data: m }] = await Promise.all([
      supabase.from("workers").select("*").order("created_at", { ascending: false }),
      supabase.from("machines").select("id, machine_name"),
    ]);
    setRows((w as Worker[]) ?? []);
    setMachines((m as Machine[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const machineName = (id: string | null) => machines.find((x) => x.id === id)?.machine_name ?? "—";

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (w: Worker) => {
    setEditing(w);
    setForm({ employee_name: w.employee_name, skill: w.skill, shift: w.shift, assigned_machine_id: w.assigned_machine_id, is_available: w.is_available });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, assigned_machine_id: form.assigned_machine_id || null };
    if (editing) {
      const { error } = await supabase.from("workers").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Worker updated");
    } else {
      const { error } = await supabase.from("workers").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Worker added");
    }
    setModal(false); load();
  };

  const toggleAvailable = async (w: Worker) => {
    const { error } = await supabase.from("workers").update({ is_available: !w.is_available }).eq("id", w.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async () => {
    if (!confirm) return;
    const { error } = await supabase.from("workers").delete().eq("id", confirm.id);
    if (error) return toast.error(error.message);
    toast.success("Worker deleted"); setConfirm(null); load();
  };

  return (
    <div>
      <PageHeader title="Workers" subtitle="Manage your workforce and shifts"
        action={isManager && <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Worker</button>} />

      <div className="stat-card !p-0 overflow-hidden" style={{ cursor: "default" }}>
        {loading ? <div className="p-4"><SkeletonTable cols={6} /></div> : rows.length === 0 ? (
          <p className="p-10 text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>No workers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Emp ID</th><th>Name</th><th>Skill</th>
                  <th>Shift</th><th>Machine</th><th>Available</th>
                  {isManager && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((w, i) => (
                  <tr key={w.id} className="table-row-anim" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{w.id.slice(0, 8)}</td>
                    <td className="font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{w.employee_name}</td>
                    <td style={{ color: "rgba(255,255,255,0.6)" }}>{w.skill}</td>
                    <td>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                        style={{ background: SHIFT_COLORS[w.shift]?.bg, color: SHIFT_COLORS[w.shift]?.color }}>
                        {w.shift}
                      </span>
                    </td>
                    <td style={{ color: "rgba(255,255,255,0.4)" }}>{machineName(w.assigned_machine_id)}</td>
                    <td>
                      <button
                        onClick={() => isManager && toggleAvailable(w)}
                        disabled={!isManager}
                        className="relative w-11 h-6 rounded-full transition-all duration-300"
                        style={{
                          background: w.is_available
                            ? "linear-gradient(135deg, #7c3aed, #2563eb)"
                            : "rgba(255,255,255,0.08)",
                          cursor: isManager ? "pointer" : "default",
                          boxShadow: w.is_available ? "0 0 12px rgba(124,58,237,0.3)" : "none",
                        }}
                        aria-label="Toggle availability"
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${w.is_available ? "translate-x-5" : ""}`}
                          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
                      </button>
                    </td>
                    {isManager && (
                      <td className="text-right">
                        <div className="inline-flex gap-1.5">
                          <button onClick={() => openEdit(w)} className="p-1.5 rounded-lg transition-all duration-200" style={{ color: "rgba(255,255,255,0.4)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setConfirm(w)} className="p-1.5 rounded-lg transition-all duration-200" style={{ color: "rgba(239,68,68,0.6)" }}
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

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Worker" : "Add Worker"}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Employee Name</label>
            <input required value={form.employee_name} onChange={(e) => setForm({ ...form, employee_name: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Skill</label>
              <input required value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} className="input-field" placeholder="e.g. Welding" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Shift</label>
              <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value as any })} className="input-field">
                <option value="morning">Morning</option><option value="evening">Evening</option><option value="night">Night</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Assigned Machine</label>
            <select value={form.assigned_machine_id ?? ""} onChange={(e) => setForm({ ...form, assigned_machine_id: e.target.value || null })} className="input-field">
              <option value="">None</option>
              {machines.map((m) => <option key={m.id} value={m.id}>{m.machine_name}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
            <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} className="w-4 h-4 rounded" style={{ accentColor: "#7c3aed" }} />
            Available
          </label>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? "Save Changes" : "Add Worker"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Delete Worker">
        <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>Delete <strong style={{ color: "rgba(255,255,255,0.9)" }}>{confirm?.employee_name}</strong>?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setConfirm(null)} className="btn-ghost">Cancel</button>
          <button onClick={remove} className="btn-danger px-4 py-2.5">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
