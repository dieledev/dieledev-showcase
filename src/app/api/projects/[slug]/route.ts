import { NextResponse } from "next/server";
import { getAllProjects, saveProjects } from "@/lib/storage";
import { validateProject } from "@/lib/validation";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const projects = await getAllProjects();
    const project = projects.find((p) => p.slug === params.slug);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error(`GET /api/projects/${params.slug} failed:`, error);
    return NextResponse.json(
      { error: "Failed to load project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const token = request.headers.get("X-Admin-Token");
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await getAllProjects();
    const index = projects.findIndex((p) => p.slug === params.slug);

    if (index === -1) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Normalize tags
    if (typeof body.tags === "string") {
      body.tags = body.tags
        .split(",")
        .map((t: string) => t.trim().toLowerCase())
        .filter(Boolean);
    }

    const errors = validateProject(body, true);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", fields: errors },
        { status: 400 }
      );
    }

    const existing = projects[index];
    const updated = {
      ...existing,
      ...(body.title !== undefined && { title: (body.title as string).trim() }),
      ...(body.description !== undefined && {
        description: (body.description as string).trim(),
      }),
      ...(body.imageUrl !== undefined && {
        imageUrl: (body.imageUrl as string).trim(),
      }),
      ...(body.linkUrl !== undefined && {
        linkUrl: (body.linkUrl as string).trim(),
      }),
      ...(body.tags !== undefined && {
        tags: (body.tags as string[]).map((t) => t.trim().toLowerCase()).filter(Boolean),
      }),
      ...(body.status !== undefined && { status: body.status }),
      updatedAt: new Date().toISOString(),
    };

    projects[index] = updated;
    await saveProjects(projects);

    return NextResponse.json({ project: updated });
  } catch (error) {
    console.error(`PUT /api/projects/${params.slug} failed:`, error);
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const token = request.headers.get("X-Admin-Token");
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await getAllProjects();
    const index = projects.findIndex((p) => p.slug === params.slug);

    if (index === -1) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    projects.splice(index, 1);
    await saveProjects(projects);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/projects/${params.slug} failed:`, error);
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    );
  }
}
