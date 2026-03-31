import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma skips all env loading when prisma.config.ts is present.
// Explicitly load .env then .env.local so DATABASE_URL and other vars
// are available for every db:* command without needing a wrapper script.
dotenv.config({ path: path.resolve(process.cwd(), ".env"),       quiet: true });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), quiet: true, override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Command run by `prisma db seed` and after `prisma migrate reset`.
    seed: "tsx prisma/seed.ts",
  },
});
