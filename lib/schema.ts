import { z } from "zod";

/**
 * The contract. Everything else in the app derives from this file:
 * the TypeScript types, the API validation, and the editor's default state.
 * If you change the shape of a wedding, change it here first.
 */

export const MAX_GALLERY_IMAGES = 10;

const id = () => z.string().min(1);

export const SectionsSchema = z.object({
  home: z.boolean(),
  details: z.boolean(),
  events: z.boolean(),
  venue: z.boolean(),
  menu: z.boolean(),
  gallery: z.boolean(),
  faqs: z.boolean(),
  rsvp: z.boolean(),
});

export const EventSchema = z.object({
  id: id(),
  name: z.string().trim().min(1, "Give the event a name").max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a real date"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).or(z.literal("")),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).or(z.literal("")),
  venue: z.string().max(120).default(""),
  address: z.string().max(240).default(""),
  description: z.string().max(1200).default(""),
  dressCode: z.string().max(80).default(""),
});

export const MenuItemSchema = z.object({
  // Stable id. This is the hook that lets you add guest meal choices later
  // without restructuring anything — do not drop it.
  id: id(),
  name: z.string().trim().min(1, "Give the dish a name").max(120),
  description: z.string().max(240).default(""),
});

export const MenuCategorySchema = z.object({
  key: z.string().min(1),
  label: z.string().trim().min(1).max(60),
  enabled: z.boolean(),
  items: z.array(MenuItemSchema).max(40),
});

export const FaqSchema = z.object({
  id: id(),
  question: z.string().trim().min(1, "Add a question").max(200),
  answer: z.string().max(1500).default(""),
});

export const GalleryImageSchema = z.object({
  id: id(),
  path: z.string().min(1),
});

export const VenueSchema = z.object({
  name: z.string().max(120).default(""),
  address: z.string().max(240).default(""),
  mapsUrl: z.string().url().or(z.literal("")).default(""),
  notes: z.string().max(800).default(""),
});

export const ContentSchema = z.object({
  coupleNames: z.string().trim().min(1, "Add both your names").max(120),
  weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  location: z.string().max(120).default(""),
  welcomeHeading: z.string().max(160).default(""),
  welcomeMessage: z.string().max(2000).default(""),
  heroPath: z.string().default(""),
  venue: VenueSchema,
  sections: SectionsSchema,
  events: z.array(EventSchema).max(20),
  menu: z.object({ categories: z.array(MenuCategorySchema).max(8) }),
  faqs: z.array(FaqSchema).max(30),
  gallery: z.array(GalleryImageSchema).max(MAX_GALLERY_IMAGES),
});

export const THEME_KEYS = ["classic", "minimal", "garden"] as const;

/** What the editor is allowed to PATCH. */
export const WeddingPatchSchema = z.object({
  content: ContentSchema,
  theme: z.enum(THEME_KEYS),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  bgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  isPublished: z.boolean(),
});

export const CreateWeddingSchema = z.object({
  coupleNames: z.string().trim().min(2, "Add both your names").max(120),
  weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick your wedding date"),
});

const FullNameSchema = z.string().trim().min(3, "Enter the guest's full name").max(120).refine(
  (name) => name.split(/\s+/).filter(Boolean).length >= 2,
  "Enter a first and last name",
);

export const RsvpSchema = z.object({
  weddingId: z.string().uuid(),
  guestNames: z.array(FullNameSchema).min(1, "Add at least one guest").max(20),
  email: z.string().email("Check that email address").or(z.literal("")),
  attending: z.boolean(),
  dietary: z.string().max(400).default(""),
  message: z.string().max(1000).default(""),
  // Honeypot. Real people leave this empty; most bots fill everything in.
  website: z.string().max(0, "Rejected").default(""),
});

export type Sections = z.infer<typeof SectionsSchema>;
export type WeddingEvent = z.infer<typeof EventSchema>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
export type MenuCategory = z.infer<typeof MenuCategorySchema>;
export type Faq = z.infer<typeof FaqSchema>;
export type GalleryImage = z.infer<typeof GalleryImageSchema>;
export type WeddingContent = z.infer<typeof ContentSchema>;
export type ThemeKey = (typeof THEME_KEYS)[number];

export type Wedding = {
  id: string;
  slug: string;
  editToken: string;
  isPublished: boolean;
  theme: ThemeKey;
  primaryColor: string;
  bgColor: string;
  content: WeddingContent;
};

export type Rsvp = {
  id: string;
  guestName: string;
  guestNames: string[];
  email: string | null;
  attending: boolean;
  partySize: number;
  dietary: string | null;
  message: string | null;
  createdAt: string;
};

export function newId() {
  return crypto.randomUUID();
}

export function defaultContent(coupleNames: string, weddingDate: string): WeddingContent {
  return {
    coupleNames,
    weddingDate,
    location: "",
    welcomeHeading: "We're so glad you're here",
    welcomeMessage: "",
    heroPath: "",
    venue: { name: "", address: "", mapsUrl: "", notes: "" },
    sections: {
      home: true, details: true, events: true, venue: true,
      menu: false, gallery: false, faqs: true, rsvp: true,
    },
    events: [],
    menu: {
      categories: [
        { key: "canapes", label: "Canapés", enabled: true, items: [] },
        { key: "starter", label: "Starter", enabled: true, items: [] },
        { key: "main", label: "Main course", enabled: true, items: [] },
        { key: "dessert", label: "Dessert", enabled: true, items: [] },
      ],
    },
    faqs: [],
    gallery: [],
  };
}
