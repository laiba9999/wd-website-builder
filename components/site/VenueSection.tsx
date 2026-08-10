import SectionHead from "./SectionHead";
import type { WeddingContent } from "@/lib/schema";

export default function VenueSection({
  venue, imageUrl,
}: { venue: WeddingContent["venue"]; imageUrl: string }) {
  if (!venue.name && !venue.address) return null;
  return (
    <section className="sec" id="venue">
      <div className="wrap">
        <SectionHead eyebrow="Getting there" title="Venue" />
        <div className={imageUrl ? "venue" : "venue no-image"}>
          {imageUrl && <div className="venue-img"><img src={imageUrl} alt="" /></div>}
          <div>
            {venue.name && <h3>{venue.name}</h3>}
            {venue.address && <address>{venue.address}</address>}
            {venue.notes && <p className="note">{venue.notes}</p>}
            {venue.mapsUrl && (
              <a className="link" href={venue.mapsUrl} target="_blank" rel="noreferrer">
                Open in Google Maps
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
