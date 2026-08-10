import type { Rsvp } from "./schema";

function cell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  // Guard against CSV formula injection when this is opened in Excel.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function rsvpsToCsv(rows: Rsvp[]): string {
  const header = [
    "Timestamp", "Guest Name", "Email", "Attending",
    "Number Attending", "Dietary Requirements", "Message",
  ];
  const lines = rows.map((r) =>
    [
      new Date(r.createdAt).toISOString(),
      r.guestName,
      r.email ?? "",
      r.attending ? "Yes" : "No",
      r.attending ? r.partySize : 0,
      r.dietary ?? "",
      r.message ?? "",
    ].map(cell).join(",")
  );
  // BOM so Excel opens accented characters correctly.
  return "\uFEFF" + [header.map(cell).join(","), ...lines].join("\r\n");
}
