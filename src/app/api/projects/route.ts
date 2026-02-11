import { NextResponse } from "next/server";
import { getAllProjects, saveProjects } from "@/lib/storage";
import { validateProject } from "@/lib/validation";
import { slugify } from "@/lib/slugify";
import { Project } from "@/lib/types";

export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET /api/projects failed:", error);
    return NextResponse.json(
      { error: "Failed to load projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const token = request.headers.get("X-Admin-Token");
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Normalize tags from string or array
    if (typeof body.tags === "string") {
      body.tags = body.tags
        .split(",")
        .map((t: string) => t.trim().toLowerCase())
        .filter(Boolean);
    }

    const errors = validateProject(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", fields: errors },
        { status: 400 }
      );
    }

    const projects = await getAllProjects();
    const slug = slugify(
      body.title,
      projects.map((p) => p.slug)
    );

    const now = new Date().toISOString();
    const newProject: Project = {
      slug,
      title: (body.title as string).trim(),
      description: (body.description as string).trim(),
      imageUrl: (body.imageUrl as string).trim(),
      linkUrl: (body.linkUrl as string).trim(),
      tags: (body.tags as string[]).map((t) => t.trim().toLowerCase()).filter(Boolean),
      status: body.status,
      createdAt: now,
      updatedAt: now,
    };

    projects.push(newProject);
    await saveProjects(projects);

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects failed:", error);
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    );
  }
}
