import SectionHead from "./SectionHead";
import type { MenuCategory } from "@/lib/schema";

export default function MenuSection({ categories }: { categories: MenuCategory[] }) {
  const visible = categories.filter((c) => c.enabled && c.items.length > 0);
  if (!visible.length) return null;
  return (
    <section className="sec" id="menu">
      <div className="wrap">
        <SectionHead eyebrow="What we're serving" title="Menu" />
        {visible.map((cat) => (
          <div className="menu-cat" key={cat.key}>
            <span className="label">{cat.label}</span>
            <div className="menu-items">
              {cat.items.map((item) => (
                <div className="menu-item" key={item.id}>
                  <div className="n">{item.name}</div>
                  {item.description && <div className="d">{item.description}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
