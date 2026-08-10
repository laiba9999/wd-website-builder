import { THEMES } from "./themes";
export { CreateWeddingSchema, defaultContent } from "./schema";

export const THEMES_DEFAULT = {
  theme: "classic" as const,
  primaryColor: THEMES.classic.primary,
  bgColor: THEMES.classic.bg,
};
