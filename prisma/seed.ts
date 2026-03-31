// Seed script — run with: npx prisma db seed
// Creates the admin user if it does not already exist.
// Safe to run multiple times — will skip if the email is already registered.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL    = "admin@local.test";
const ADMIN_PASSWORD = "Admin123!ChangeMe";
const ADMIN_NAME     = "Admin";

async function main() {
  const existing = await prisma.user.findUnique({
    where:  { email: ADMIN_EMAIL },
    select: { id: true, role: true },
  });

  if (existing) {
    console.log(`Seed: admin user already exists (id=${existing.id}, role=${existing.role}). Skipping.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.create({
    data: {
      email:          ADMIN_EMAIL,
      name:           ADMIN_NAME,
      hashedPassword,
      role:           "ADMIN",
    },
  });

  console.log(`Seed: created admin user (id=${admin.id}, email=${admin.email}).`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
