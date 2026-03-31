import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Command run by `prisma db seed` and after `prisma migrate reset`.
    seed: "tsx prisma/seed.ts",
  },
});
