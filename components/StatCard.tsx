export default function StatCard({
  label,
  value,
  icon,
  color,
  sublabel,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  sublabel?: string;
}) {
  return (
    <div
      className="rounded-lg p-3"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      <div className="text-xs text-text-dim font-[family-name:var(--font-mono)] mb-0.5">
        {icon} {label}
      </div>
      <div
        className="text-xl font-bold font-[family-name:var(--font-mono)] stat-number"
        style={{ color }}
      >
        {value}
      </div>
      {sublabel && (
        <div className="text-xs text-text-faint font-[family-name:var(--font-mono)] mt-0.5 truncate">
          {sublabel}
        </div>
      )}
    </div>
  );
}
