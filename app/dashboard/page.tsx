import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/supabase-server";
import { getWeddingsByOwner } from "@/lib/db";
import { formatLongDate } from "@/lib/format";

// A couple's own list, and it changes the moment they create or publish
// something. Never cache it.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const weddings = await getWeddingsByOwner(user.id);

  return (
    <main className="ed-shell" style={{ padding: "40px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <header style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          gap: 16, flexWrap: "wrap", marginBottom: 28,
        }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-cormorant), serif", fontWeight: 300,
              fontSize: "2rem", margin: "0 0 4px",
            }}>
              Your sites
            </h1>
            <p style={{ color: "#8a8580", fontSize: ".8rem", margin: 0 }}>{user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="ed-btn" type="submit">Sign out</button>
          </form>
        </header>

        {weddings.length === 0 ? (
          <div className="ed-card">
            <p style={{ margin: "0 0 18px", color: "#5d5952", lineHeight: 1.7 }}>
              Nothing here yet. Any site you create while signed in will show up on this page.
            </p>
            <p style={{ margin: "0 0 20px", color: "#8a8580", fontSize: ".84rem", lineHeight: 1.7 }}>
              Made a site before signing in? It still works — open its edit link as usual. This page
              only lists sites created while signed in.
            </p>
            <Link className="ed-btn primary" href="/create">Start a site</Link>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gap: 12 }}>
              {weddings.map((w) => (
                <div key={w.id} className="ed-card" style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", gap: 16, flexWrap: "wrap",
                }}>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{
                      fontFamily: "var(--font-cormorant), serif", fontWeight: 400,
                      fontSize: "1.35rem", margin: "0 0 4px",
                    }}>
                      {w.content.coupleNames || "Untitled"}
                    </h2>
                    <p style={{ color: "#8a8580", fontSize: ".8rem", margin: 0 }}>
                      {formatLongDate(w.content.weddingDate) || "No date yet"}
                      {" · "}
                      {w.isPublished ? "Live" : "Not published"}
                      {" · /w/"}{w.slug}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {w.isPublished && (
                      <Link className="ed-btn" href={`/w/${w.slug}`}>View</Link>
                    )}
                    <Link className="ed-btn primary" href={`/e/${w.editToken}`}>Edit</Link>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <Link className="ed-btn" href="/create">Start another site</Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
