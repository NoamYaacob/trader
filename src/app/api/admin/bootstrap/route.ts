// One-time admin bootstrap endpoint.
// Promotes an existing user to ADMIN by email.
//
// Protection: only active when ADMIN_BOOTSTRAP_SECRET is set in the environment.
// After use, remove ADMIN_BOOTSTRAP_SECRET from Vercel env vars to disable permanently.
//
// Usage:
//   curl -X POST https://your-app.vercel.app/api/admin/bootstrap \
//     -H "Content-Type: application/json" \
//     -d '{"secret":"<ADMIN_BOOTSTRAP_SECRET>","email":"you@example.com"}'

import { NextResponse } from "next/server";
import { prisma } from "@/db/client";

export async function POST(req: Request) {
  const secret = process.env.ADMIN_BOOTSTRAP_SECRET;

  // If no secret is configured, this endpoint does not exist.
  if (!secret) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let body: { secret?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (body.secret !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where:  { email },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: `No user found with email: ${email}` }, { status: 404 });
  }

  if (user.role === "ADMIN") {
    return NextResponse.json({ message: `${email} is already ADMIN.` });
  }

  await prisma.user.update({
    where: { id: user.id },
    data:  { role: "ADMIN" },
  });

  return NextResponse.json({ message: `${email} promoted to ADMIN.` });
}
