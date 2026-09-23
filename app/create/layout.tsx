import { redirect } from "next/navigation";
import { currentUser } from "@/lib/supabase-server";

export default async function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/create");

  return children;
}
