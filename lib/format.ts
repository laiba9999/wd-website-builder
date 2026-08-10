const LOCALE = "en-GB";

export function formatLongDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(LOCALE, {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export function dayNumber(iso: string): string {
  if (!iso) return "";
  return String(new Date(`${iso}T12:00:00`).getDate());
}

export function dayMonthShort(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(LOCALE, { weekday: "short", month: "short" });
}

export function timeRange(start: string, end: string): string {
  if (!start) return "";
  return end ? `${start} – ${end}` : `From ${start}`;
}

/** Events always render in chronological order, so the couple never has to sort them. */
export function byDateTime<T extends { date: string; startTime: string }>(list: T[]): T[] {
  return [...list].sort((a, b) =>
    `${a.date}T${a.startTime || "00:00"}`.localeCompare(`${b.date}T${b.startTime || "00:00"}`)
  );
}
