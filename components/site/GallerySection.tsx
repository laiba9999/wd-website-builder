import SectionHead from "./SectionHead";

export default function GallerySection({ urls }: { urls: string[] }) {
  if (!urls.length) return null;
  return (
    <section className="sec" id="gallery">
      <div className="wrap">
        <SectionHead eyebrow="Us, mostly" title="Gallery" />
        <div className="gal">
          {urls.map((url) => (
            <a key={url} href={url} target="_blank" rel="noreferrer">
              <img src={url} alt="" loading="lazy" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
