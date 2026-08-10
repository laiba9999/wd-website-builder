"use client";

export default function Toggle({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%", cursor: "pointer",
        border: "1px solid #e3e1dc", borderRadius: 9, padding: "10px 12px",
        background: "#fff", font: "inherit", textAlign: "left", color: "#1b1a18",
      }}
    >
      <span style={{
        width: 32, height: 18, borderRadius: 999, flex: "none", position: "relative",
        background: checked ? "#3f6a34" : "#d9d6d0", transition: "background .15s",
      }}>
        <span style={{
          position: "absolute", top: 2, left: 2, width: 14, height: 14, borderRadius: "50%",
          background: "#fff", transform: checked ? "translateX(14px)" : "none", transition: "transform .15s",
        }} />
      </span>
      {label}
    </button>
  );
}
