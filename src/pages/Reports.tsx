import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export default function Reports() {
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, machines: 0, busy: 0, workers: 0 });
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: o }, { data: m }, { data: w }] = await Promise.all([
        supabase.from("orders").select("*"),
        supabase.from("machines").select("*"),
        supabase.from("workers").select("*"),
      ]);
      const O = o ?? []; const M = m ?? []; const W = w ?? [];
      setOrders(O);
      setStats({
        total: O.length,
        pending: O.filter((x) => x.status === "pending").length,
        inProgress: O.filter((x) => x.status === "in-progress").length,
        completed: O.filter((x) => x.status === "completed").length,
        machines: M.length,
        busy: M.filter((x) => x.status === "busy").length,
        workers: W.length,
      });
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

  const cards = [
    { label: "Total Orders", value: stats.total },
    { label: "Pending", value: stats.pending },
    { label: "In Progress", value: stats.inProgress },
    { label: "Completed", value: stats.completed },
    { label: "Machines", value: stats.machines },
    { label: "Busy Machines", value: stats.busy },
    { label: "Workers", value: stats.workers },
    { label: "Completion Rate", value: stats.total ? `${Math.round((stats.completed / stats.total) * 100)}%` : "0%" },
  ];

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Production summary and exports"
        action={<button onClick={exportPdf} className="btn-primary"><Download size={16} /> Export PDF</button>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={c.label} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</div>
            <div className="text-3xl font-bold text-foreground mt-1.5">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
