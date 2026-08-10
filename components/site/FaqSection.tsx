import SectionHead from "./SectionHead";
import type { Faq } from "@/lib/schema";

export default function FaqSection({ faqs }: { faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <section className="sec" id="faq">
      <div className="wrap">
        <SectionHead eyebrow="Before you ask" title="Questions" />
        <div className="faqs">
          {faqs.map((f) => (
            <div className="faq" key={f.id}>
              <h3>{f.question}</h3>
              {f.answer && <p>{f.answer}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
