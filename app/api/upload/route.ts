import { db, BUCKET, getWeddingByToken, publicUrl } from "@/lib/db";

const MAX_BYTES = 1_500_000; // images arrive already compressed in the browser
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  const form = await req.formData();
  const token = String(form.get("token") ?? "");
  const kind = String(form.get("kind") ?? "gallery"); // "hero" | "venue" | "gallery"
  const file = form.get("file");

  const wedding = await getWeddingByToken(token);
  if (!wedding) return Response.json({ error: "Not found" }, { status: 404 });
  if (!(file instanceof File)) return Response.json({ error: "No image received" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) {
    return Response.json({ error: "Use a JPG, PNG or WEBP" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "That image is still too large after compression" }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `weddings/${wedding.id}/${kind}/${crypto.randomUUID()}.${ext}`;

  const { error } = await db.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) return Response.json({ error: "Upload failed. Try again." }, { status: 500 });

  return Response.json({ path, url: publicUrl(path) }, { status: 201 });
}
