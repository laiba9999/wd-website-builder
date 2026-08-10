import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWeddingBySlug, publicUrl } from "@/lib/db";
import { formatLongDate } from "@/lib/format";
import SiteShell from "@/components/site/SiteShell";
import Hero from "@/components/site/Hero";
import DetailsSection from "@/components/site/DetailsSection";
import EventsSection from "@/components/site/EventsSection";
import VenueSection from "@/components/site/VenueSection";
import MenuSection from "@/components/site/MenuSection";
import GallerySection from "@/components/site/GallerySection";
import FaqSection from "@/components/site/FaqSection";
import RsvpForm from "@/components/site/RsvpForm";

/**
 * No cache, so a save in the editor is live on the next request with zero
 * invalidation logic. If this ever gets real traffic, swap to ISR and call
 * revalidatePath("/w/<slug>") from the PATCH handler.
 */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ token?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const wedding = await getWeddingBySlug(slug);
  if (!wedding) return { title: "Not found" };
  const date = formatLongDate(wedding.content.weddingDate);
  return {
    title: `${wedding.content.coupleNames}${date ? ` · ${date}` : ""}`,
    description: wedding.content.welcomeMessage.slice(0, 160) || "You're invited.",
    openGraph: {
      title: wedding.content.coupleNames,
      images: wedding.content.heroPath ? [publicUrl(wedding.content.heroPath)] : [],
    },
    robots: wedding.isPublished ? undefined : { index: false, follow: false },
  };
}

export default async function PublicWeddingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { token } = await searchParams;
  const wedding = await getWeddingBySlug(slug);
  if (!wedding) notFound();

  // Unpublished sites are the preview: reachable only with the edit token.
  // That is the whole of "preview mode" — one condition, not a second renderer.
  const isPreview = !wedding.isPublished;
  if (isPreview && token !== wedding.editToken) notFound();

  const c = wedding.content;
  const s = c.sections;
  const galleryUrls = c.gallery.map((g) => publicUrl(g.path));

  return (
    <>
      {isPreview && (
        <div style={{
          background: "#1b1a18", color: "#fff", textAlign: "center",
          padding: "10px 16px", fontSize: ".8rem",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        }}>
          Preview — only people with your edit link can see this. Publish it when you&rsquo;re ready.
        </div>
      )}
      <SiteShell theme={wedding.theme} primary={wedding.primaryColor} bg={wedding.bgColor} sections={s}>
        {s.home && <Hero content={c} heroUrl={c.heroPath ? publicUrl(c.heroPath) : ""} />}
        {s.details && <DetailsSection content={c} />}
        {s.events && <EventsSection events={c.events} />}
        {s.venue && <VenueSection venue={c.venue} imageUrl="" />}
        {s.menu && <MenuSection categories={c.menu.categories} />}
        {s.gallery && <GallerySection urls={galleryUrls} />}
        {s.faqs && <FaqSection faqs={c.faqs} />}
        {s.rsvp && wedding.isPublished && <RsvpForm weddingId={wedding.id} />}
        <footer className="foot">
          <div className="wrap">
            {c.coupleNames}
            {c.weddingDate ? ` · ${formatLongDate(c.weddingDate)}` : ""}
          </div>
        </footer>
      </SiteShell>
    </>
  );
}
