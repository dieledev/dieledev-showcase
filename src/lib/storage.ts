import { readFile } from "fs/promises";
import { join } from "path";
import { put, list } from "@vercel/blob";
import { Project } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "projects.json");
const BLOB_KEY = "data/projects.json";

/** Read projects: try Vercel Blob first, fall back to local file */
export async function getAllProjects(): Promise<Project[]> {
  // Try Vercel Blob first
  try {
    const { blobs } = await list({ prefix: BLOB_KEY });
    const blob = blobs.find((b) => b.pathname === BLOB_KEY);
    if (blob) {
      const res = await fetch(blob.url, { cache: "no-store" });
      return (await res.json()) as Project[];
    }
  } catch {
    // Blob not available (local dev or not configured), fall through
  }

  // Fall back to local file
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data) as Project[];
  } catch {
    return [];
  }
}

export async function getProjectBySlug(
  slug: string
): Promise<Project | null> {
  const projects = await getAllProjects();
  return projects.find((p) => p.slug === slug) ?? null;
}

/** Save projects to Vercel Blob */
export async function saveProjects(projects: Project[]): Promise<void> {
  try {
    await put(BLOB_KEY, JSON.stringify(projects, null, 2), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });
  } catch (error) {
    console.error("Failed to save projects:", error);
    throw new Error("Failed to save data");
  }
}
