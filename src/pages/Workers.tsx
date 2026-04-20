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

      <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        {loading ? <div className="p-4"><SkeletonTable cols={6} /></div> : rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No workers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Emp ID</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Skill</th>
                  <th className="px-4 py-3">Shift</th><th className="px-4 py-3">Machine</th><th className="px-4 py-3">Available</th>
                  {isManager && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((w, i) => (
                  <tr key={w.id} className="border-t border-border table-row-anim hover:bg-secondary/30 transition-colors" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{w.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{w.employee_name}</td>
                    <td className="px-4 py-3">{w.skill}</td>
                    <td className="px-4 py-3 capitalize">{w.shift}</td>
                    <td className="px-4 py-3 text-muted-foreground">{machineName(w.assigned_machine_id)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => isManager && toggleAvailable(w)}
                        disabled={!isManager}
                        className={`relative w-11 h-6 rounded-full transition-colors ${w.is_available ? "bg-accent" : "bg-muted"} ${isManager ? "cursor-pointer" : "cursor-default"}`}
                        aria-label="Toggle availability"
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${w.is_available ? "translate-x-5" : ""}`} />
                      </button>
                    </td>
                    {isManager && (
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button onClick={() => openEdit(w)} className="p-1.5 rounded-md hover:bg-secondary transition-colors"><Pencil size={15} /></button>
                          <button onClick={() => setConfirm(w)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"><Trash2 size={15} /></button>
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
            <label className="block text-xs font-semibold mb-1.5">Employee Name</label>
            <input required value={form.employee_name} onChange={(e) => setForm({ ...form, employee_name: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Skill</label>
              <input required value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} className="input-field" placeholder="e.g. Welding" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Shift</label>
              <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value as any })} className="input-field">
                <option value="morning">Morning</option><option value="evening">Evening</option><option value="night">Night</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Assigned Machine</label>
            <select value={form.assigned_machine_id ?? ""} onChange={(e) => setForm({ ...form, assigned_machine_id: e.target.value || null })} className="input-field">
              <option value="">None</option>
              {machines.map((m) => <option key={m.id} value={m.id}>{m.machine_name}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} className="w-4 h-4 accent-[hsl(var(--accent))]" />
            Available
          </label>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? "Save Changes" : "Add Worker"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Delete Worker">
        <p className="text-sm text-muted-foreground mb-5">Delete <strong className="text-foreground">{confirm?.employee_name}</strong>?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setConfirm(null)} className="btn-ghost">Cancel</button>
          <button onClick={remove} className="btn-danger px-4 py-2.5">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
