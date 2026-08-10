export function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="ed-field" style={{ marginBottom: 16 }}>
      <label>{label}</label>
      {children}
      {hint && <p style={{ margin: "6px 0 0", fontSize: ".76rem", color: "#8a8580" }}>{hint}</p>}
    </div>
  );
}

export function Grid({ cols = 2, children }: { cols?: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: 16 }}>
      {children}
    </div>
  );
}

export function Card({
  title, hint, children, right,
}: { title: string; hint?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="ed-card">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: ".95rem" }}>{title}</h3>
          {hint && <p style={{ margin: "4px 0 18px", color: "#7a766e", fontSize: ".8rem", maxWidth: "60ch" }}>{hint}</p>}
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}
