export default function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="sec-head">
      <span className="label">{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  );
}
