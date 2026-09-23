"use client";
import { useState } from "react";
import SectionHead from "./SectionHead";

export default function RsvpForm({ weddingId }: { weddingId: string }) {
  const [attending, setAttending] = useState(true);
  const [guestNames, setGuestNames] = useState([""]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weddingId,
          guestNames: (attending ? guestNames : guestNames.slice(0, 1)).map((name) => name.trim()),
          email: String(form.get("email") ?? ""),
          attending,
          dietary: String(form.get("dietary") ?? ""),
          message: String(form.get("message") ?? ""),
          website: String(form.get("website") ?? ""),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "That didn't send. Try again in a moment.");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't send. Try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="sec" id="rsvp">
      <div className="wrap">
        <SectionHead eyebrow="Let us know" title="RSVP" />
        {done ? (
          <div className="thanks">
            <h3>{attending ? "Wonderful — see you there" : "Thank you for letting us know"}</h3>
            <p>
              {attending
                ? "Your reply is in. We'll be in touch closer to the date."
                : "We'll miss you, but we're glad you told us."}
            </p>
          </div>
        ) : (
          <form className="rsvp" onSubmit={submit}>
            <div className="field">
              <label htmlFor="guestName-0">{attending ? "Full name of each guest" : "Your full name"}</label>
              {guestNames.slice(0, attending ? guestNames.length : 1).map((name, index) => (
                <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input
                    id={`guestName-${index}`}
                    value={name}
                    onChange={(e) => setGuestNames((names) =>
                      names.map((item, i) => i === index ? e.target.value : item)
                    )}
                    required
                    maxLength={120}
                    autoComplete={index === 0 ? "name" : "off"}
                    placeholder={index === 0 ? "First and last name" : `Guest ${index + 1} — first and last name`}
                  />
                  {attending && index > 0 && (
                    <button
                      type="button"
                      className="ed-btn"
                      aria-label={`Remove guest ${index + 1}`}
                      onClick={() => setGuestNames((names) => names.filter((_, i) => i !== index))}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {attending && guestNames.length < 20 && (
                <button type="button" className="ed-btn" onClick={() => setGuestNames((names) => [...names, ""])}>
                  Add another guest
                </button>
              )}
            </div>

            <div className="field">
              <label htmlFor="email">
                Email <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span>
              </label>
              <input id="email" name="email" type="email" maxLength={200} autoComplete="email" />
            </div>

            <div className="field">
              <label>Will you be there?</label>
              <div className="choice">
                <button type="button" aria-pressed={attending} onClick={() => setAttending(true)}>
                  Joyfully accepts
                </button>
                <button type="button" aria-pressed={!attending} onClick={() => setAttending(false)}>
                  Regretfully declines
                </button>
              </div>
            </div>

            {attending && (
              <div className="row">
                <div className="field">
                  <label htmlFor="dietary">Dietary requirements</label>
                  <input id="dietary" name="dietary" maxLength={400} placeholder="No nuts" />
                </div>
              </div>
            )}

            <div className="field">
              <label htmlFor="message">Anything else</label>
              <textarea id="message" name="message" rows={3} maxLength={1000}
                placeholder="A note for the two of us" />
            </div>

            {/* Honeypot: real guests never see this, most bots fill it in. */}
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <button className="submit" type="submit" disabled={sending}>
              {sending ? "Sending" : "Send our reply"}
            </button>
            {error && <p className="form-error">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
