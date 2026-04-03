import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma skips all env loading when prisma.config.ts is present.
// Explicitly load .env then .env.local so DATABASE_URL and other vars
// are available for every db:* command without needing a wrapper script.
dotenv.config({ path: path.resolve(process.cwd(), ".env"),       quiet: true });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), quiet: true, override: true });

// On macOS, Prisma's Schema Engine hangs against hosted Postgres (Neon, Supabase, etc.)
// when the connection URL uses the default sslmode=prefer. The engine sends a non-SSL
// probe first; hosted providers stall the SSL upgrade and the engine waits indefinitely
// because no connect_timeout is set.
//
// Fix: for any non-local DATABASE_URL, append sslmode=require (skip the probe) and
// connect_timeout=15 (hard ceiling so a cold-start never hangs the terminal).
// Localhost URLs are left unchanged — local Postgres typically has no SSL.
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  const isLocal =
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.includes("::1");

  if (!isLocal) {
    const params: string[] = [];
    if (!url.includes("sslmode="))        params.push("sslmode=require");
    if (!url.includes("connect_timeout=")) params.push("connect_timeout=15");
    if (params.length > 0) {
      const sep = url.includes("?") ? "&" : "?";
      process.env.DATABASE_URL = url + sep + params.join("&");
    }
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Command run by `prisma db seed` and after `prisma migrate reset`.
    seed: "tsx prisma/seed.ts",
  },
});
