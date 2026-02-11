import { NextResponse } from "next/server";
import { unlink, access } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

/** DELETE /api/media/[filename] — remove an uploaded image */
export async function DELETE(
  request: Request,
  { params }: { params: { filename: string } }
) {
  const token = request.headers.get("X-Admin-Token");
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const filename = params.filename;

    // Prevent path traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json(
        { error: "Invalid filename" },
        { status: 400 }
      );
    }

    const filepath = join(UPLOAD_DIR, filename);

    // Check file exists
    try {
      await access(filepath);
    } catch {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    await unlink(filepath);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/media/${params.filename} failed:`, error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
