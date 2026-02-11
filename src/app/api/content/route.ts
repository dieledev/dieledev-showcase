import { NextResponse } from "next/server";
import { getSiteContent, saveSiteContent } from "@/lib/content";
import { SiteContent } from "@/lib/types";

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json({ content });
  } catch (error) {
    console.error("GET /api/content failed:", error);
    return NextResponse.json(
      { error: "Failed to load content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const token = request.headers.get("X-Admin-Token");
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const content = body.content as SiteContent;

    if (!content || typeof content !== "object") {
      return NextResponse.json(
        { error: "content object is required" },
        { status: 400 }
      );
    }

    await saveSiteContent(content);
    return NextResponse.json({ content });
  } catch (error) {
    console.error("PUT /api/content failed:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}
