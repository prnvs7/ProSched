export default function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 animate-fade-in">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-lg bg-card border border-border">
          {Array.from({ length: cols }).map((__, j) => (
            <div key={j} className="h-4 flex-1 rounded bg-secondary animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}
