import { readFile, writeFile, mkdir, rename } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { NavItem } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const NAV_FILE = join(DATA_DIR, "navigation.json");

export async function getNavItems(): Promise<NavItem[]> {
  try {
    const data = await readFile(NAV_FILE, "utf-8");
    const items = JSON.parse(data) as NavItem[];
    return items.sort((a, b) => a.order - b.order);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(NAV_FILE, "[]", "utf-8");
      return [];
    }
    console.error("Failed to read navigation:", error);
    throw new Error("Failed to load navigation");
  }
}

export async function saveNavItems(items: NavItem[]): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const tmpFile = join(DATA_DIR, `.navigation-${randomUUID()}.tmp`);
    await writeFile(tmpFile, JSON.stringify(items, null, 2), "utf-8");
    await rename(tmpFile, NAV_FILE);
  } catch (error) {
    console.error("Failed to save navigation:", error);
    throw new Error("Failed to save navigation");
  }
}
