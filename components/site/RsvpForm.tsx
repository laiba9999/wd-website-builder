"use client";
import { useState } from "react";
import SectionHead from "./SectionHead";

export default function RsvpForm({ weddingId }: { weddingId: string }) {
  const [attending, setAttending] = useState(true);
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
          guestName: String(form.get("guestName") ?? ""),
          email: String(form.get("email") ?? ""),
          attending,
          partySize: attending ? Number(form.get("partySize") ?? 1) : 1,
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
              <label htmlFor="guestName">Your name</label>
              <input id="guestName" name="guestName" required maxLength={120} autoComplete="name" />
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
                  <label htmlFor="partySize">How many of you</label>
                  <input id="partySize" name="partySize" type="number" defaultValue={1} min={1} max={20} />
                </div>
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
