import SectionHead from "./SectionHead";
import { byDateTime, dayNumber, dayMonthShort, timeRange } from "@/lib/format";
import type { WeddingEvent } from "@/lib/schema";

export default function EventsSection({ events }: { events: WeddingEvent[] }) {
  if (!events.length) return null;
  return (
    <section className="sec" id="events">
      <div className="wrap">
        <SectionHead eyebrow="The celebrations" title="Events" />
        <div className="events">
          {byDateTime(events).map((e) => (
            <article className="event" key={e.id}>
              <div className="event-when">
                <div className="d">{dayNumber(e.date)}</div>
                <div className="m">{dayMonthShort(e.date)}</div>
                {e.startTime && <div className="t">{timeRange(e.startTime, e.endTime)}</div>}
              </div>
              <div>
                <h3>{e.name}</h3>
                {(e.venue || e.address) && (
                  <p className="where">{[e.venue, e.address].filter(Boolean).join(" · ")}</p>
                )}
                {e.description && <p>{e.description}</p>}
                {e.dressCode && <span className="dress">{e.dressCode}</span>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
