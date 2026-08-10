"use client";
import { useState } from "react";
import Link from "next/link";
import type { Wedding, WeddingContent, ThemeKey } from "@/lib/schema";
import { newId, MAX_GALLERY_IMAGES } from "@/lib/schema";
import { THEME_LIST, THEMES } from "@/lib/themes";
import { Card, Field, Grid } from "./Field";
import Toggle from "./Toggle";
import RepeatableList from "./RepeatableList";
import ImageUploader from "./ImageUploader";

const TABS = ["Basics", "Sections", "Events", "Menu", "Gallery", "FAQs", "Theme"] as const;
type Tab = (typeof TABS)[number];

const SECTION_LABELS: Record<keyof WeddingContent["sections"], string> = {
  home: "Home", details: "Wedding details", events: "Events", venue: "Venue",
  menu: "Menu", gallery: "Gallery", faqs: "FAQs", rsvp: "RSVP",
};

export default function EditorClient({
  wedding, siteUrl, publicImageBase,
}: { wedding: Wedding; siteUrl: string; publicImageBase: string }) {
  const [tab, setTab] = useState<Tab>("Basics");
  const [content, setContent] = useState<WeddingContent>(wedding.content);
  const [theme, setTheme] = useState<ThemeKey>(wedding.theme);
  const [primary, setPrimary] = useState(wedding.primaryColor);
  const [bg, setBg] = useState(wedding.bgColor);
  const [published, setPublished] = useState(wedding.isPublished);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /** Every edit funnels through here so "unsaved changes" is always accurate. */
  function edit(fn: (draft: WeddingContent) => WeddingContent) {
    setContent((c) => fn(structuredClone(c)));
    setDirty(true);
  }
  const url = (path: string) => `${publicImageBase}/${path}`;

  async function save(nextPublished = published) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/weddings/${wedding.editToken}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content, theme, primaryColor: primary, bgColor: bg, isPublished: nextPublished,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Couldn't save");
      setPublished(nextPublished);
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  const publicHref = published
    ? `/w/${wedding.slug}`
    : `/w/${wedding.slug}?token=${wedding.editToken}`;

  return (
    <div className="ed-shell">
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        padding: "14px 22px", background: "#fff", borderBottom: "1px solid #e3e1dc",
        position: "sticky", top: 0, zIndex: 5, flexWrap: "wrap",
      }}>
        <div>
          <strong>{content.coupleNames || "Your wedding"}</strong>
          <span style={{ color: "#7a766e", fontSize: ".8rem", marginLeft: 10 }}>
            {siteUrl.replace(/^https?:\/\//, "")}/w/{wedding.slug}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase",
            background: published ? "#e8f0e4" : "#f1efeb", color: published ? "#3f6a34" : "#7a766e",
            padding: "5px 10px", borderRadius: 999,
          }}>
            {published ? "Published" : "Not published"}
          </span>
          <Link className="ed-btn" href={`/e/${wedding.editToken}/rsvps`}>Replies</Link>
          <a className="ed-btn" href={publicHref} target="_blank" rel="noreferrer">
            {published ? "View site" : "Preview"}
          </a>
          {!published && (
            <button className="ed-btn" onClick={() => save(true)} disabled={saving}>Publish</button>
          )}
          <button className="ed-btn primary" onClick={() => save()} disabled={saving || !dirty}>
            {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </button>
        </div>
      </header>

      {error && (
        <p style={{ background: "#fdecea", color: "#b3261e", margin: 0, padding: "10px 22px", fontSize: ".85rem" }}>
          {error}
        </p>
      )}

      <div style={{
        display: "grid", gridTemplateColumns: "minmax(0,214px) minmax(0,1fr)",
        gap: 22, maxWidth: 1120, margin: "0 auto", padding: 22,
      }}>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, position: "sticky", top: 76, alignSelf: "start" }}>
          {TABS.map((t) => (
            <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)}
              style={{
                font: "inherit", textAlign: "left", cursor: "pointer", border: 0, borderRadius: 8,
                padding: "9px 12px", display: "flex", justifyContent: "space-between",
                background: tab === t ? "#fff" : "transparent",
                color: tab === t ? "#1b1a18" : "#5d5952",
                fontWeight: tab === t ? 600 : 400,
                boxShadow: tab === t ? "0 1px 2px rgba(0,0,0,.05)" : "none",
              }}>
              {t}
              <span style={{ color: "#a5a199", fontSize: ".78rem" }}>{counts(content)[t]}</span>
            </button>
          ))}
        </nav>

        <div>
          {tab === "Basics" && (
            <>
              <Card title="The two of you" hint="This is what people see first. The ampersand picks up your accent colour automatically.">
                <Field label="Your names"><input value={content.coupleNames}
                  onChange={(e) => edit((c) => ({ ...c, coupleNames: e.target.value }))} /></Field>
                <Grid>
                  <Field label="Wedding date"><input type="date" value={content.weddingDate}
                    onChange={(e) => edit((c) => ({ ...c, weddingDate: e.target.value }))} /></Field>
                  <Field label="Town or city"><input value={content.location} placeholder="London"
                    onChange={(e) => edit((c) => ({ ...c, location: e.target.value }))} /></Field>
                </Grid>
                <Field label="Hero image" hint="One landscape photo. It is resized and compressed here before it is uploaded.">
                  {content.heroPath ? (
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <img src={url(content.heroPath)} alt="" style={{ width: 160, height: 90, objectFit: "cover", borderRadius: 8 }} />
                      <button className="ed-btn danger" type="button"
                        onClick={() => edit((c) => ({ ...c, heroPath: "" }))}>Remove</button>
                    </div>
                  ) : (
                    <ImageUploader token={wedding.editToken} kind="hero" label="Choose a photo"
                      onUploaded={(path) => edit((c) => ({ ...c, heroPath: path }))} />
                  )}
                </Field>
              </Card>

              <Card title="Welcome message" hint="A short paragraph on the home page. Line breaks are kept.">
                <Field label="Heading"><input value={content.welcomeHeading}
                  onChange={(e) => edit((c) => ({ ...c, welcomeHeading: e.target.value }))} /></Field>
                <Field label="Message"><textarea rows={5} value={content.welcomeMessage}
                  onChange={(e) => edit((c) => ({ ...c, welcomeMessage: e.target.value }))} /></Field>
              </Card>

              <Card title="Main venue" hint="Where the day itself happens. Individual events can have their own addresses.">
                <Grid>
                  <Field label="Venue name"><input value={content.venue.name}
                    onChange={(e) => edit((c) => ({ ...c, venue: { ...c.venue, name: e.target.value } }))} /></Field>
                  <Field label="Google Maps link"><input value={content.venue.mapsUrl} placeholder="https://maps.app.goo.gl/…"
                    onChange={(e) => edit((c) => ({ ...c, venue: { ...c.venue, mapsUrl: e.target.value } }))} /></Field>
                </Grid>
                <Field label="Address"><textarea rows={3} value={content.venue.address}
                  onChange={(e) => edit((c) => ({ ...c, venue: { ...c.venue, address: e.target.value } }))} /></Field>
                <Field label="Parking and travel notes"><textarea rows={3} value={content.venue.notes}
                  onChange={(e) => edit((c) => ({ ...c, venue: { ...c.venue, notes: e.target.value } }))} /></Field>
              </Card>
            </>
          )}

          {tab === "Sections" && (
            <Card title="Sections" hint="Turn off anything you don't need. Hidden sections keep their content — nothing is deleted.">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 10 }}>
                {(Object.keys(SECTION_LABELS) as (keyof typeof SECTION_LABELS)[]).map((key) => (
                  <Toggle key={key} label={SECTION_LABELS[key]} checked={content.sections[key]}
                    onChange={(v) => edit((c) => ({ ...c, sections: { ...c.sections, [key]: v } }))} />
                ))}
              </div>
            </Card>
          )}

          {tab === "Events" && (
            <Card title="Events" hint="Add every celebration. They appear on the site in date order, so you never have to sort them.">
              <RepeatableList
                items={content.events}
                onChange={(events) => edit((c) => ({ ...c, events }))}
                blank={() => ({ id: newId(), name: "", date: content.weddingDate, startTime: "", endTime: "", venue: "", address: "", description: "", dressCode: "" })}
                summary={(e) => ({ title: e.name, sub: [e.date, e.startTime, e.venue].filter(Boolean).join(" · ") })}
                addLabel="Add an event"
                emptyLabel="No events yet. Mehndi, Nikah, Walima, reception — whatever you're having."
                fields={(e, patch) => (
                  <>
                    <Grid>
                      <Field label="Event name"><input value={e.name} placeholder="Mehndi"
                        onChange={(ev) => patch({ name: ev.target.value })} /></Field>
                      <Field label="Dress code"><input value={e.dressCode} placeholder="Bright colours"
                        onChange={(ev) => patch({ dressCode: ev.target.value })} /></Field>
                    </Grid>
                    <Grid cols={3}>
                      <Field label="Date"><input type="date" value={e.date}
                        onChange={(ev) => patch({ date: ev.target.value })} /></Field>
                      <Field label="Starts"><input type="time" value={e.startTime}
                        onChange={(ev) => patch({ startTime: ev.target.value })} /></Field>
                      <Field label="Ends (optional)"><input type="time" value={e.endTime}
                        onChange={(ev) => patch({ endTime: ev.target.value })} /></Field>
                    </Grid>
                    <Grid>
                      <Field label="Venue"><input value={e.venue}
                        onChange={(ev) => patch({ venue: ev.target.value })} /></Field>
                      <Field label="Address"><input value={e.address}
                        onChange={(ev) => patch({ address: ev.target.value })} /></Field>
                    </Grid>
                    <Field label="Description"><textarea rows={3} value={e.description}
                      onChange={(ev) => patch({ description: ev.target.value })} /></Field>
                  </>
                )}
              />
            </Card>
          )}

          {tab === "Menu" && (
            <>
              <Card title="Menu" hint="Turn on the courses you're serving. A course with no dishes is hidden automatically.">
                <p style={{ margin: "0 0 14px", fontSize: ".8rem", color: "#7a766e" }}>
                  Showing the menu on the site is controlled under Sections.
                </p>
              </Card>
              {content.menu.categories.map((cat, i) => (
                <Card key={cat.key} title={cat.label}
                  right={<Toggle label={cat.enabled ? "Showing" : "Hidden"} checked={cat.enabled}
                    onChange={(v) => edit((c) => {
                      c.menu.categories[i].enabled = v; return c;
                    })} />}>
                  {cat.enabled && (
                    <RepeatableList
                      items={cat.items}
                      onChange={(items) => edit((c) => { c.menu.categories[i].items = items; return c; })}
                      blank={() => ({ id: newId(), name: "", description: "" })}
                      summary={(it) => ({ title: it.name, sub: it.description })}
                      addLabel={`Add a dish to ${cat.label.toLowerCase()}`}
                      emptyLabel="Nothing here yet."
                      fields={(it, patch) => (
                        <Grid>
                          <Field label="Dish"><input value={it.name} placeholder="Tandoori chicken"
                            onChange={(ev) => patch({ name: ev.target.value })} /></Field>
                          <Field label="Description"><input value={it.description} placeholder="Pilau rice and vegetables"
                            onChange={(ev) => patch({ description: ev.target.value })} /></Field>
                        </Grid>
                      )}
                    />
                  )}
                </Card>
              ))}
            </>
          )}

          {tab === "Gallery" && (
            <Card title="Gallery"
              hint={`Up to ${MAX_GALLERY_IMAGES} photos. Each one is resized and compressed in your browser before it uploads, so the site stays fast.`}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10, marginBottom: 14 }}>
                {content.gallery.map((g) => (
                  <div key={g.id} style={{ position: "relative" }}>
                    <img src={url(g.path)} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8 }} />
                    <button type="button" className="ed-btn danger"
                      style={{ position: "absolute", top: 6, right: 6, padding: "3px 8px", fontSize: ".7rem" }}
                      onClick={() => edit((c) => ({ ...c, gallery: c.gallery.filter((x) => x.id !== g.id) }))}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <ImageUploader token={wedding.editToken} kind="gallery"
                disabled={content.gallery.length >= MAX_GALLERY_IMAGES}
                label={content.gallery.length >= MAX_GALLERY_IMAGES
                  ? `That's all ${MAX_GALLERY_IMAGES}. Remove one to add another.`
                  : `Add photos (${content.gallery.length} of ${MAX_GALLERY_IMAGES})`}
                onUploaded={(path) => edit((c) =>
                  c.gallery.length >= MAX_GALLERY_IMAGES ? c : { ...c, gallery: [...c.gallery, { id: newId(), path }] })} />
            </Card>
          )}

          {tab === "FAQs" && (
            <Card title="Questions" hint="Answer the things people will otherwise text you at eleven at night.">
              <RepeatableList
                items={content.faqs}
                onChange={(faqs) => edit((c) => ({ ...c, faqs }))}
                blank={() => ({ id: newId(), question: "", answer: "" })}
                summary={(f) => ({ title: f.question, sub: f.answer.slice(0, 90) })}
                addLabel="Add a question"
                emptyLabel="Parking, dress code, children, RSVP deadline — those four cover most of it."
                fields={(f, patch) => (
                  <>
                    <Field label="Question"><input value={f.question} placeholder="Is there parking?"
                      onChange={(ev) => patch({ question: ev.target.value })} /></Field>
                    <Field label="Answer"><textarea rows={3} value={f.answer}
                      onChange={(ev) => patch({ answer: ev.target.value })} /></Field>
                  </>
                )}
              />
            </Card>
          )}

          {tab === "Theme" && (
            <Card title="Look and feel" hint="Pick a style, then adjust the two colours if you want something closer to your stationery.">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
                {THEME_LIST.map((t) => (
                  <button key={t.key} type="button" aria-pressed={theme === t.key}
                    onClick={() => { setTheme(t.key); setPrimary(t.primary); setBg(t.bg); setDirty(true); }}
                    style={{
                      width: 170, textAlign: "left", background: "#fff", font: "inherit", cursor: "pointer",
                      padding: 14, borderRadius: 10,
                      border: theme === t.key ? "1px solid #1b1a18" : "1px solid #e3e1dc",
                      boxShadow: theme === t.key ? "0 0 0 1px #1b1a18" : "none",
                    }}>
                    <div style={{ height: 44, borderRadius: 6, marginBottom: 10, background: `linear-gradient(120deg, ${t.primary}, ${t.bg})` }} />
                    <div style={{ fontSize: ".84rem", fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: ".72rem", color: "#7a766e", marginTop: 2 }}>{t.blurb}</div>
                  </button>
                ))}
              </div>
              <Grid>
                <Field label="Accent colour" hint="Headings, buttons and the ampersand.">
                  <input type="color" value={primary} onChange={(e) => { setPrimary(e.target.value); setDirty(true); }}
                    style={{ height: 42, padding: 4 }} />
                </Field>
                <Field label="Background colour">
                  <input type="color" value={bg} onChange={(e) => { setBg(e.target.value); setDirty(true); }}
                    style={{ height: 42, padding: 4 }} />
                </Field>
              </Grid>
              <button type="button" className="ed-btn"
                onClick={() => { setPrimary(THEMES[theme].primary); setBg(THEMES[theme].bg); setDirty(true); }}>
                Reset to the theme&rsquo;s own colours
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function counts(c: WeddingContent): Record<Tab, string> {
  const dishes = c.menu.categories.reduce((n, cat) => n + cat.items.length, 0);
  return {
    Basics: "",
    Sections: `${Object.values(c.sections).filter(Boolean).length} on`,
    Events: String(c.events.length),
    Menu: String(dishes),
    Gallery: `${c.gallery.length}/${MAX_GALLERY_IMAGES}`,
    FAQs: String(c.faqs.length),
    Theme: "",
  };
}
