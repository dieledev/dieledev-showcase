import { readFile, writeFile, mkdir, rename } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { Project } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "projects.json");

export async function getAllProjects(): Promise<Project[]> {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data) as Project[];
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(DATA_FILE, "[]", "utf-8");
      return [];
    }
    console.error("Failed to read projects:", error);
    throw new Error("Failed to load projects");
  }
}

export async function getProjectBySlug(
  slug: string
): Promise<Project | null> {
  const projects = await getAllProjects();
  return projects.find((p) => p.slug === slug) ?? null;
}

export async function saveProjects(projects: Project[]): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const tmpFile = join(DATA_DIR, `.projects-${randomUUID()}.tmp`);
    await writeFile(tmpFile, JSON.stringify(projects, null, 2), "utf-8");
    await rename(tmpFile, DATA_FILE);
  } catch (error) {
    console.error("Failed to save projects:", error);
    throw new Error("Failed to save data");
  }
}
