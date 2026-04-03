// Proxy for Vercel Blob private-store images.
// Browsers cannot add an Authorization header in <img src>, so this route
// fetches the blob with the server-side token and streams it back.
// Cache-Control is set to immutable — blob content never changes at a given URL.

import { NextResponse } from "next/server";

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const blobUrl = searchParams.get("url");

  if (!blobUrl) {
    return NextResponse.json({ error: "Missing url parameter." }, { status: 400 });
  }

  // Restrict to Vercel Blob hostnames to prevent open-proxy abuse.
  let parsed: URL;
  try {
    parsed = new URL(blobUrl);
  } catch {
    return NextResponse.json({ error: "Invalid url." }, { status: 400 });
  }
  if (!parsed.hostname.endsWith(".blob.vercel-storage.com")) {
    return NextResponse.json({ error: "URL not allowed." }, { status: 403 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Blob storage is not configured." }, { status: 500 });
  }

  const upstream = await fetch(blobUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!upstream.ok) {
    return new NextResponse(null, { status: upstream.status });
  }

  const buffer = await upstream.arrayBuffer();
  const contentType = upstream.headers.get("Content-Type") ?? "image/jpeg";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":  contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
