import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob storage — used for uploaded setup example images in production.
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // Restrict ESLint to application source only.
  // prisma/ and prisma.config.ts are Node.js scripts, not Next.js app code.
  eslint: {
    dirs: ["src"],
  },
};

export default nextConfig;
