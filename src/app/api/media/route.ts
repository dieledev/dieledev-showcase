import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** GET /api/media — list all uploaded images */
export async function GET() {
  try {
    const { blobs } = await list();

    const images = blobs.map((blob) => ({
      filename: blob.pathname,
      url: blob.url,
    }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error("GET /api/media failed:", error);
    return NextResponse.json(
      { error: "Failed to list media" },
      { status: 500 }
    );
  }
}

/** POST /api/media — upload an image */
export async function POST(request: Request) {
  const token = request.headers.get("X-Admin-Token");
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate type
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Use JPEG, PNG, GIF, WebP, or SVG." },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5 MB." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.includes(".")
      ? `.${file.name.split(".").pop()}`
      : ".jpg";
    const baseName = sanitizeFilename(file.name.replace(/\.[^.]+$/, ""));
    const pathname = `uploads/${timestamp}-${baseName}${ext}`;

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: "public",
    });

    return NextResponse.json(
      {
        image: {
          filename: blob.pathname,
          url: blob.url,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/media failed:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
