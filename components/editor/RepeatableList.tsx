"use client";
import { useState } from "react";

/**
 * Events, menu items and FAQs are the same interaction: an array of objects with
 * add, edit and delete. Building it once here is the single biggest time saving
 * in the editor — three features, one component.
 */
export default function RepeatableList<T extends { id: string }>({
  items, onChange, blank, summary, fields, addLabel, emptyLabel,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  blank: () => T;
  summary: (item: T) => { title: string; sub: string };
  fields: (item: T, patch: (p: Partial<T>) => void) => React.ReactNode;
  addLabel: string;
  emptyLabel: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const patch = (id: string, p: Partial<T>) =>
    onChange(items.map((it) => (it.id === id ? { ...it, ...p } : it)));

  const remove = (id: string) => {
    onChange(items.filter((it) => it.id !== id));
    if (openId === id) setOpenId(null);
  };

  const add = () => {
    const item = blank();
    onChange([...items, item]);
    setOpenId(item.id);
  };

  return (
    <div>
      {items.length === 0 && (
        <p style={{ color: "#8a8580", fontSize: ".85rem", margin: "0 0 12px" }}>{emptyLabel}</p>
      )}

      {items.map((item) => {
        const open = openId === item.id;
        const s = summary(item);
        return (
          <div key={item.id} style={{
            border: "1px solid #e3e1dc", borderRadius: 10, marginBottom: 10,
            overflow: "hidden", background: open ? "#fbfaf8" : "#fff",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: "14px 16px" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{s.title || "Untitled"}</div>
                {s.sub && <div style={{ color: "#7a766e", fontSize: ".8rem", marginTop: 3 }}>{s.sub}</div>}
              </div>
              <div style={{ display: "flex", gap: 8, flex: "none" }}>
                <button type="button" className="ed-btn" onClick={() => setOpenId(open ? null : item.id)}>
                  {open ? "Done" : "Edit"}
                </button>
                <button type="button" className="ed-btn danger" onClick={() => remove(item.id)}>Delete</button>
              </div>
            </div>
            {open && (
              <div style={{ padding: "4px 16px 18px", borderTop: "1px solid #eeece8" }}>
                {fields(item, (p) => patch(item.id, p))}
              </div>
            )}
          </div>
        );
      })}

      <button type="button" className="ed-ghost" onClick={add}>{addLabel}</button>
    </div>
  );
}
