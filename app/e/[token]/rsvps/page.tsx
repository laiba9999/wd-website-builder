import Link from "next/link";
import { notFound } from "next/navigation";
import { db, getWeddingByToken } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function RsvpsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const wedding = await getWeddingByToken(token);
  if (!wedding) notFound();

  const { data } = await db
    .from("rsvps").select("*").eq("wedding_id", wedding.id)
    .order("created_at", { ascending: false });
  const rows = data ?? [];

  const yes = rows.filter((r) => r.attending);
  const heads = yes.reduce((n, r) => n + (r.party_size ?? 1), 0);
  const dietary = rows.filter((r) => r.dietary);

  return (
    <div className="ed-shell">
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        padding: "14px 22px", background: "#fff", borderBottom: "1px solid #e3e1dc", flexWrap: "wrap",
      }}>
        <strong>Replies</strong>
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="ed-btn" href={`/e/${token}`}>Back to the editor</Link>
          <a className="ed-btn primary" href={`/api/rsvps/${token}`}>Download CSV</a>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: 22 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 18 }}>
          <Stat label="Replies" value={rows.length} />
          <Stat label="Coming" value={yes.length} />
          <Stat label="Guests in total" value={heads} />
          <Stat label="Dietary notes" value={dietary.length} />
        </div>

        <div className="ed-card" style={{ padding: 0, overflowX: "auto" }}>
          {rows.length === 0 ? (
            <p style={{ padding: 30, textAlign: "center", color: "#7a766e", margin: 0 }}>
              No replies yet. They&rsquo;ll appear here the moment someone sends one.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".85rem" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#7a766e", borderBottom: "1px solid #e3e1dc" }}>
                  {["Received", "Name", "Email", "Attending", "Guests", "Dietary", "Message"].map((h) => (
                    <th key={h} style={{ padding: "12px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f0eeea" }}>
                    <td style={cell}>{new Date(r.created_at).toLocaleDateString("en-GB")}</td>
                    <td style={{ ...cell, fontWeight: 600 }}>{r.guest_name}</td>
                    <td style={cell}>{r.email ?? "—"}</td>
                    <td style={cell}>{r.attending ? "Yes" : "No"}</td>
                    <td style={cell}>{r.attending ? r.party_size : "—"}</td>
                    <td style={cell}>{r.dietary ?? "—"}</td>
                    <td style={{ ...cell, maxWidth: 320 }}>{r.message ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const cell: React.CSSProperties = { padding: "12px 14px", verticalAlign: "top" };

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="ed-card" style={{ margin: 0, padding: "16px 18px" }}>
      <div style={{ fontSize: "1.7rem", fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: ".72rem", letterSpacing: ".1em", textTransform: "uppercase", color: "#7a766e", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}
