import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";

const InviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  inviteCode: z.string().min(1, "Enter your invitation code").max(200),
});

function codesMatch(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length
    && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function POST(request: Request) {
  const parsed = InviteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Check the form" },
      { status: 400 },
    );
  }

  const expectedCode = process.env.INVITE_CODE;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!expectedCode || !siteUrl) {
    return Response.json(
      { error: "Invitations are not configured yet." },
      { status: 503 },
    );
  }

  if (!codesMatch(parsed.data.inviteCode, expectedCode)) {
    return Response.json(
      { error: "That invitation code isn't valid." },
      { status: 403 },
    );
  }

  // Admin invitations use an implicit callback rather than PKCE, so the
  // browser must receive the invite tokens directly on this client page.
  const redirectTo = `${siteUrl.replace(/\/$/, "")}/set-password`;
  const { error } = await db.auth.admin.inviteUserByEmail(parsed.data.email, {
    redirectTo,
  });

  if (error) {
    console.error("POST /api/auth/invite failed:", error.message);
    return Response.json(
      { error: "Couldn't send the invitation. Try again." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
