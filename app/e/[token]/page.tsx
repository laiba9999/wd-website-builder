import { notFound } from "next/navigation";
import { getWeddingByToken, publicUrl } from "@/lib/db";
import EditorClient from "@/components/editor/EditorClient";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function EditorPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const wedding = await getWeddingByToken(token);
  if (!wedding) notFound();

  // Derive the storage base once on the server so the client can build image
  // URLs without importing anything that touches the service-role key.
  const sample = publicUrl("x");
  const publicImageBase = sample.slice(0, sample.length - 2);

  return (
    <EditorClient
      wedding={wedding}
      siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ""}
      publicImageBase={publicImageBase}
    />
  );
}
