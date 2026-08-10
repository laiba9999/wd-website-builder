import { themeVars } from "@/lib/themes";
import type { ThemeKey, Sections } from "@/lib/schema";

const NAV: { key: keyof Sections; href: string; label: string }[] = [
  { key: "details", href: "#details", label: "Details" },
  { key: "events", href: "#events", label: "Events" },
  { key: "venue", href: "#venue", label: "Venue" },
  { key: "menu", href: "#menu", label: "Menu" },
  { key: "gallery", href: "#gallery", label: "Gallery" },
  { key: "faqs", href: "#faq", label: "FAQs" },
  { key: "rsvp", href: "#rsvp", label: "RSVP" },
];

export default function SiteShell({
  theme, primary, bg, sections, children,
}: {
  theme: ThemeKey; primary: string; bg: string; sections: Sections; children: React.ReactNode;
}) {
  const links = NAV.filter((n) => sections[n.key]);
  return (
    <div className="site" data-theme={theme} style={themeVars(theme, primary, bg)}>
      {links.length > 1 && (
        <nav className="nav">
          <div className="nav-in">
            {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
          </div>
        </nav>
      )}
      {children}
    </div>
  );
}
