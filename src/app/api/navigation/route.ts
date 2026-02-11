import { NextResponse } from "next/server";
import { getNavItems, saveNavItems } from "@/lib/navigation";
import { NavItem } from "@/lib/types";

export async function GET() {
  try {
    const items = await getNavItems();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/navigation failed:", error);
    return NextResponse.json(
      { error: "Failed to load navigation" },
      { status: 500 }
    );
  }
}

/** PUT — replace all nav items at once */
export async function PUT(request: Request) {
  const token = request.headers.get("X-Admin-Token");
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const items = body.items as NavItem[];

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "items must be an array" },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.id || !item.label?.trim() || !item.href?.trim()) {
        return NextResponse.json(
          { error: "Each item needs an id, label, and href" },
          { status: 400 }
        );
      }
    }

    // Normalize
    const normalized: NavItem[] = items.map((item, i) => ({
      id: item.id,
      label: item.label.trim(),
      href: item.href.trim(),
      order: item.order ?? i,
    }));

    await saveNavItems(normalized);
    return NextResponse.json({ items: normalized });
  } catch (error) {
    console.error("PUT /api/navigation failed:", error);
    return NextResponse.json(
      { error: "Failed to save navigation" },
      { status: 500 }
    );
  }
}
