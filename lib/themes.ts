import type { CSSProperties } from "react";
import type { ThemeKey } from "./schema";

/**
 * A theme is a set of CSS custom properties, not a separate component tree.
 * SiteShell puts these on a wrapper element; every component under components/site
 * styles itself from var(--…) only. Adding a fourth theme is an entry in this file.
 *
 * `primary` and `bg` here are only defaults — the couple's chosen colours override them.
 */

export type Theme = {
  key: ThemeKey;
  name: string;
  blurb: string;
  primary: string;
  bg: string;
  ink: string;
  muted: string;
  surface: string;
  line: string;
  display: string;
  body: string;
  radius: string;
  track: string;
  shadow: string;
  displayWeight: string;
  displayStyle: string;
};

export const THEMES: Record<ThemeKey, Theme> = {
  classic: {
    key: "classic",
    name: "Classic elegant",
    blurb: "Engraved, centred, serif — reads like letterpress stationery.",
    primary: "#8a6d3b",
    bg: "#fbf9f5",
    ink: "#1f1b16",
    muted: "#6b6157",
    surface: "#ffffff",
    line: "rgba(31,27,22,.16)",
    display: "var(--font-cormorant), Georgia, serif",
    body: "var(--font-lato), system-ui, sans-serif",
    radius: "0px",
    track: ".3em",
    shadow: "none",
    displayWeight: "300",
    displayStyle: "normal",
  },
  minimal: {
    key: "minimal",
    name: "Modern minimal",
    blurb: "Left-aligned, no ornament, the date set as oversized numerals.",
    primary: "#111111",
    bg: "#fcfcfa",
    ink: "#111111",
    muted: "#7c7c76",
    surface: "#ffffff",
    line: "rgba(17,17,17,.13)",
    display: "var(--font-inter), system-ui, sans-serif",
    body: "var(--font-inter), system-ui, sans-serif",
    radius: "0px",
    track: ".2em",
    shadow: "none",
    displayWeight: "500",
    displayStyle: "normal",
  },
  garden: {
    key: "garden",
    name: "Romantic garden",
    blurb: "Arch-topped photographs, soft cards, italic headings.",
    primary: "#6b7f5e",
    bg: "#f6f2ec",
    ink: "#2e3328",
    muted: "#6e7566",
    surface: "#fffdfa",
    line: "rgba(46,51,40,.13)",
    display: "var(--font-playfair), Georgia, serif",
    body: "var(--font-karla), system-ui, sans-serif",
    radius: "18px",
    track: ".14em",
    shadow: "0 18px 44px -30px rgba(46,51,40,.5)",
    displayWeight: "400",
    displayStyle: "italic",
  },
};

export const THEME_LIST = Object.values(THEMES);

/** Turns a theme plus the couple's two colour choices into inline CSS variables. */
export function themeVars(key: ThemeKey, primary: string, bg: string): CSSProperties {
  const t = THEMES[key] ?? THEMES.classic;
  return {
    "--bg": bg || t.bg,
    "--ink": t.ink,
    "--muted": t.muted,
    "--primary": primary || t.primary,
    "--surface": t.surface,
    "--line": t.line,
    "--display": t.display,
    "--body": t.body,
    "--radius": t.radius,
    "--track": t.track,
    "--shadow": t.shadow,
    "--display-weight": t.displayWeight,
    "--display-style": t.displayStyle,
  } as CSSProperties;
}
