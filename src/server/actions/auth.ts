"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/db/client";

// ─── Schemas ──────────────────────────────────────────────────────────

const signInSchema = z.object({
  email:    z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const signUpSchema = z.object({
  name:     z.string().min(1, "Name is required.").max(80),
  email:    z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

// ─── Actions ──────────────────────────────────────────────────────────

export async function signInAction(data: {
  email: string;
  password: string;
}): Promise<{ error: string } | undefined> {
  const parsed = signInSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message ?? "Invalid input.";
    return { error: msg };
  }

  try {
    await signIn("credentials", {
      email:      parsed.data.email,
      password:   parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    // NEXT_REDIRECT is thrown by Next.js — must be re-thrown to complete the redirect.
    throw error;
  }
}

export async function signUpAction(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ error: string } | undefined> {
  const parsed = signUpSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message ?? "Invalid input.";
    return { error: msg };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name:           parsed.data.name,
      email:          parsed.data.email,
      hashedPassword,
    },
  });

  try {
    await signIn("credentials", {
      email:      parsed.data.email,
      password:   parsed.data.password,
      redirectTo: "/onboarding",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created but sign-in failed. Please sign in manually." };
    }
    throw error;
  }
}
