// Seed script — run with: npx prisma db seed
// Creates the admin user and PropFirmTemplate reference data.
// Safe to run multiple times — skips records that already exist.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL    = "admin@local.test";
const ADMIN_PASSWORD = "Admin123!ChangeMe";
const ADMIN_NAME     = "Admin";

// Reference daily loss limits are for a $50k account as a starting point.
// Users can override when setting up their account.
const PROP_FIRM_TEMPLATES = [
  {
    name:             "apex",
    displayName:      "Apex Trader Funding",
    defaultDailyLoss: 1000,
    eodFlatRule:      false,
    trailingDrawdown: true,
    consistencyRule:  false,
    payoutAvailable:  true,
    notes:            "Trailing max drawdown resets to highest account value. No EOD flat rule on most plans.",
  },
  {
    name:             "topstep",
    displayName:      "Topstep",
    defaultDailyLoss: 1000,
    eodFlatRule:      true,
    trailingDrawdown: false,
    consistencyRule:  true,
    payoutAvailable:  true,
    notes:            "Must be flat by end of day. Consistency rule applies: no single day should exceed 30% of total profit.",
  },
  {
    name:             "tpt",
    displayName:      "Take Profit Trader",
    defaultDailyLoss: 1000,
    eodFlatRule:      false,
    trailingDrawdown: true,
    consistencyRule:  false,
    payoutAvailable:  true,
    notes:            "Trailing drawdown based on highest equity. Weekly payouts available on funded accounts.",
  },
  {
    name:             "mff",
    displayName:      "My Funded Futures",
    defaultDailyLoss: 1000,
    eodFlatRule:      true,
    trailingDrawdown: false,
    consistencyRule:  false,
    payoutAvailable:  true,
    notes:            "EOD flat rule enforced. Static daily loss limit.",
  },
  {
    name:             "tradeify",
    displayName:      "Tradeify",
    defaultDailyLoss: 1000,
    eodFlatRule:      false,
    trailingDrawdown: true,
    consistencyRule:  false,
    payoutAvailable:  true,
    notes:            "Formerly known as Bulenox. Trailing drawdown on most plans.",
  },
  {
    name:             "e8",
    displayName:      "E8 Funding",
    defaultDailyLoss: 800,
    eodFlatRule:      false,
    trailingDrawdown: false,
    consistencyRule:  true,
    payoutAvailable:  true,
    notes:            "Static drawdown. Consistency rule: best day cannot exceed 40% of total profit.",
  },
  {
    name:             "custom",
    displayName:      "Custom / Other",
    defaultDailyLoss: null,
    eodFlatRule:      false,
    trailingDrawdown: false,
    consistencyRule:  false,
    payoutAvailable:  false,
    notes:            "Use this if your firm is not listed. You can set all rules manually.",
  },
] as const;

async function main() {
  // ── Admin user ──────────────────────────────────────────────────────────────
  const existing = await prisma.user.findUnique({
    where:  { email: ADMIN_EMAIL },
    select: { id: true, role: true },
  });

  if (!existing) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const admin = await prisma.user.create({
      data: { email: ADMIN_EMAIL, name: ADMIN_NAME, hashedPassword, role: "ADMIN" },
    });
    console.log(`Seed: created admin user (id=${admin.id}, email=${admin.email}).`);
  } else {
    console.log(`Seed: admin user already exists (id=${existing.id}). Skipping.`);
  }

  // ── PropFirmTemplate reference data ─────────────────────────────────────────
  for (const tpl of PROP_FIRM_TEMPLATES) {
    await prisma.propFirmTemplate.upsert({
      where:  { name: tpl.name },
      update: {
        displayName:      tpl.displayName,
        defaultDailyLoss: tpl.defaultDailyLoss ?? null,
        eodFlatRule:      tpl.eodFlatRule,
        trailingDrawdown: tpl.trailingDrawdown,
        consistencyRule:  tpl.consistencyRule,
        payoutAvailable:  tpl.payoutAvailable,
        notes:            tpl.notes,
      },
      create: {
        name:             tpl.name,
        displayName:      tpl.displayName,
        defaultDailyLoss: tpl.defaultDailyLoss ?? null,
        eodFlatRule:      tpl.eodFlatRule,
        trailingDrawdown: tpl.trailingDrawdown,
        consistencyRule:  tpl.consistencyRule,
        payoutAvailable:  tpl.payoutAvailable,
        notes:            tpl.notes,
      },
    });
    console.log(`Seed: upserted PropFirmTemplate "${tpl.displayName}".`);
  }
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
