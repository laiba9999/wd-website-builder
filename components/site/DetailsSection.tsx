import SectionHead from "./SectionHead";
import type { WeddingContent } from "@/lib/schema";

export default function DetailsSection({ content }: { content: WeddingContent }) {
  if (!content.welcomeHeading && !content.welcomeMessage) return null;
  return (
    <section className="sec" id="details">
      <div className="wrap">
        <SectionHead eyebrow="Welcome" title={content.welcomeHeading || "Welcome"} />
        {content.welcomeMessage && <p className="lede">{content.welcomeMessage}</p>}
      </div>
    </section>
  );
}
