import Countdown from "./Countdown";
import { formatLongDate } from "@/lib/format";
import type { WeddingContent } from "@/lib/schema";

/** Splits "Laiba & Aamir" so the ampersand can carry the accent colour. */
function Names({ value }: { value: string }) {
  const m = value.match(/^(.*?)\s*(&|and)\s*(.*)$/i);
  if (!m) return <>{value}</>;
  return <>{m[1]} <span className="amp">&amp;</span> {m[3]}</>;
}

export default function Hero({ content, heroUrl }: { content: WeddingContent; heroUrl: string }) {
  const date = formatLongDate(content.weddingDate);
  return (
    <header className="hero">
      <div className="wrap">
        <p className="label">We&rsquo;re getting married</p>
        <h1 className="names"><Names value={content.coupleNames} /></h1>
        {date && (
          <p className="hero-date">
            {date}{content.location ? ` · ${content.location}` : ""}
          </p>
        )}
        {content.weddingDate && <Countdown date={content.weddingDate} />}
        {heroUrl && (
          <div className="hero-img">
            <img src={heroUrl} alt="" />
          </div>
        )}
      </div>
    </header>
  );
}
