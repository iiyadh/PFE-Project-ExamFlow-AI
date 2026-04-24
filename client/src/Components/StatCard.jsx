const StatCard = ({ icon, label, value, accent }) => (
  <div className="rounded-xl p-5 border flex items-center gap-4" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${accent}20` }}>
      <span style={{ color: accent, fontSize: 20 }}>{icon}</span>
    </div>
    <div>
      <div className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>{value}</div>
      <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{label}</div>
    </div>
  </div>
);

export default StatCard;
