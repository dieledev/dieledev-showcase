import { NextResponse } from "next/server";
import { del, list } from "@vercel/blob";

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

    // Find the blob by pathname
    const { blobs } = await list();
    const blob = blobs.find(
      (b) => b.pathname === filename || b.pathname === `uploads/${filename}`
    );

    if (!blob) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    await del(blob.url);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/media/${params.filename} failed:`, error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
