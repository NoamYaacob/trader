import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTraderProfile, getActiveAccount } from "@/features/prop-guard/data/prop-guard";

// Redirect to the first incomplete setup step.
export default async function SetupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId  = session.user.id;
  const profile = await getTraderProfile(userId);
  if (!profile) redirect("/setup/trader");

  const account = await getActiveAccount(userId);
  if (!account) redirect("/setup/firm");

  redirect("/setup/guardrails");
}
