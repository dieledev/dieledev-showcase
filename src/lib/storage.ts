import { readFile } from "fs/promises";
import { join } from "path";
import { put, list } from "@vercel/blob";
import { Project } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "projects.json");
const BLOB_KEY = "data/projects.json";

// Module-level cache for blob URL (persists within same serverless invocation)
let cachedBlobUrl: string | null = null;

/** Read projects: try Vercel Blob first, fall back to local file */
export async function getAllProjects(): Promise<Project[]> {
  // Try Vercel Blob first
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      // Try cached URL first (faster, avoids list call)
      if (cachedBlobUrl) {
        try {
          const res = await fetch(cachedBlobUrl, { cache: "no-store" });
          if (res.ok) {
            return (await res.json()) as Project[];
          }
        } catch {
          // Cached URL failed, try list
          cachedBlobUrl = null;
        }
      }

      const { blobs } = await list({ prefix: BLOB_KEY });
      const blob = blobs.find((b) => b.pathname === BLOB_KEY);
      if (blob) {
        cachedBlobUrl = blob.url;
        const res = await fetch(blob.url, { cache: "no-store" });
        if (res.ok) {
          return (await res.json()) as Project[];
        }
        console.error("Blob fetch failed with status:", res.status);
      }
    } catch (error) {
      console.error("Blob read failed, falling back to local:", error);
    }
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
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not configured. Add Vercel Blob storage to your project."
    );
  }

  const blob = await put(BLOB_KEY, JSON.stringify(projects, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });

  // Update cached URL for subsequent reads in same invocation
  cachedBlobUrl = blob.url;
}
