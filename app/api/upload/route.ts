import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { blobConfigured } from "@/lib/videos";

export const runtime = "nodejs";

const ALLOWED_TYPES = [
  "video/mp4",
  "video/quicktime", // .mov
  "video/webm",
  "image/jpeg", // thumbnails
  "application/json", // meta records
];

const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500MB — generous for phone clips

/**
 * Token-exchange endpoint for Vercel Blob client uploads.
 * The browser uploads directly to Blob storage (so big videos never pass
 * through a serverless function body), but every upload must be authorized
 * here first — where we enforce type and size limits.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!blobConfigured()) {
    return NextResponse.json(
      {
        error:
          "Storage isn't configured. Set BLOB_READ_WRITE_TOKEN (connect a Vercel Blob store, or run `vercel env pull .env.local` locally).",
      },
      { status: 503 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const isVideo = pathname.startsWith("videos/");
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: isVideo ? MAX_VIDEO_BYTES : 5 * 1024 * 1024,
          addRandomSuffix: false,
        };
      },
      onUploadCompleted: async () => {
        // No server-side bookkeeping needed — meta/<id>.json IS the record.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload authorization failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
