import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh", display: "grid", placeItems: "center",
      background: "#f4f3f0", color: "#1b1a18", padding: "24px",
      fontFamily: "var(--font-inter), system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <p style={{ fontSize: ".7rem", letterSpacing: ".24em", textTransform: "uppercase", color: "#8a8580" }}>
          Wedding sites
        </p>
        <h1 style={{
          fontFamily: "var(--font-cormorant), serif", fontWeight: 300, fontSize: "clamp(2.4rem,7vw,3.6rem)",
          lineHeight: 1.1, margin: "16px 0 0",
        }}>
          Fill in a form. Get a wedding website.
        </h1>
        <p style={{ color: "#5d5952", marginTop: 16, lineHeight: 1.7 }}>
          Your names, your events, your menu, your photos. Pick one of three looks,
          share the link, and change anything you like afterwards.
        </p>
        <Link href="/create" className="ed-btn primary"
          style={{ display: "inline-block", marginTop: 28, padding: "14px 26px", textDecoration: "none" }}>
          Start your site
        </Link>
      </div>
    </main>
  );
}
