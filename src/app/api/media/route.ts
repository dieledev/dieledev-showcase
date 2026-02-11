import { NextResponse } from "next/server";
import { readdir, mkdir, writeFile } from "fs/promises";
import { join, extname } from "path";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
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
    await mkdir(UPLOAD_DIR, { recursive: true });
    const files = await readdir(UPLOAD_DIR);

    const images = files
      .filter((f) => {
        const ext = extname(f).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext);
      })
      .map((f) => ({
        filename: f,
        url: `/uploads/${f}`,
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

    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const ext = extname(file.name) || ".jpg";
    const baseName = sanitizeFilename(
      file.name.replace(ext, "")
    );
    const filename = `${timestamp}-${baseName}${ext}`;
    const filepath = join(UPLOAD_DIR, filename);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    return NextResponse.json(
      {
        image: {
          filename,
          url: `/uploads/${filename}`,
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
