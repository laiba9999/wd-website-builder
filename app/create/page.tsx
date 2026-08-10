"use client";
import { useState } from "react";
import Link from "next/link";

export default function CreatePage() {
  const [names, setNames] = useState("");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ slug: string; editToken: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/weddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupleNames: names, weddingDate: date }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Couldn't create that");
      setCreated(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create that");
    } finally {
      setBusy(false);
    }
  }

  const editUrl = created
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/e/${created.editToken}`
    : "";

  return (
    <main className="ed-shell" style={{ display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 540 }}>
        {!created ? (
          <form className="ed-card" onSubmit={submit}>
            <h1 style={{
              fontFamily: "var(--font-cormorant), serif", fontWeight: 300,
              fontSize: "2rem", margin: "0 0 6px",
            }}>
              Start your wedding site
            </h1>
            <p style={{ color: "#7a766e", margin: "0 0 22px", fontSize: ".88rem" }}>
              Two things now, everything else afterwards.
            </p>

            <div className="ed-field" style={{ marginBottom: 16 }}>
              <label htmlFor="names">Your names</label>
              <input id="names" value={names} placeholder="Laiba & Aamir" required
                onChange={(e) => setNames(e.target.value)} />
            </div>
            <div className="ed-field" style={{ marginBottom: 20 }}>
              <label htmlFor="date">Wedding date</label>
              <input id="date" type="date" value={date} required onChange={(e) => setDate(e.target.value)} />
            </div>

            <button className="ed-btn primary" style={{ width: "100%", padding: 13 }} disabled={busy}>
              {busy ? "Creating…" : "Create my site"}
            </button>
            {error && <p style={{ color: "#b3261e", fontSize: ".85rem", marginTop: 12 }}>{error}</p>}
          </form>
        ) : (
          <div className="ed-card">
            <h1 style={{
              fontFamily: "var(--font-cormorant), serif", fontWeight: 300,
              fontSize: "2rem", margin: "0 0 6px",
            }}>
              Save this link
            </h1>
            <p style={{ color: "#7a766e", margin: "0 0 18px", fontSize: ".88rem" }}>
              It&rsquo;s the only way back into your site — there are no passwords to remember and none to
              forget. Bookmark it, and send it to yourself so you have a copy.
            </p>

            <div style={{
              background: "#faf9f7", border: "1px solid #e3e1dc", borderRadius: 10,
              padding: "12px 14px", fontSize: ".82rem", wordBreak: "break-all", marginBottom: 12,
            }}>
              {editUrl}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="ed-btn" type="button"
                onClick={() => { navigator.clipboard.writeText(editUrl); setCopied(true); }}>
                {copied ? "Copied" : "Copy link"}
              </button>
              <a className="ed-btn"
                href={`mailto:?subject=${encodeURIComponent("Our wedding site editor")}&body=${encodeURIComponent(editUrl)}`}>
                Email it to me
              </a>
              <Link className="ed-btn primary" href={`/e/${created.editToken}`}>Open the editor</Link>
            </div>

            <p style={{ color: "#8a8580", fontSize: ".78rem", marginTop: 18, marginBottom: 0 }}>
              Your guests will use a different address: /w/{created.slug}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
