import { readFile } from "fs/promises";
import { join } from "path";
import { put, list } from "@vercel/blob";
import { NavItem } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const NAV_FILE = join(DATA_DIR, "navigation.json");
const BLOB_KEY = "data/navigation.json";

/** Read nav items: try Vercel Blob first, fall back to local file */
export async function getNavItems(): Promise<NavItem[]> {
  // Try Vercel Blob first
  try {
    const { blobs } = await list({ prefix: BLOB_KEY });
    const blob = blobs.find((b) => b.pathname === BLOB_KEY);
    if (blob) {
      const res = await fetch(blob.url, { cache: "no-store" });
      const items = (await res.json()) as NavItem[];
      return items.sort((a, b) => a.order - b.order);
    }
  } catch {
    // Blob not available, fall through
  }

  // Fall back to local file
  try {
    const data = await readFile(NAV_FILE, "utf-8");
    const items = JSON.parse(data) as NavItem[];
    return items.sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

/** Save nav items to Vercel Blob */
export async function saveNavItems(items: NavItem[]): Promise<void> {
  try {
    await put(BLOB_KEY, JSON.stringify(items, null, 2), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });
  } catch (error) {
    console.error("Failed to save navigation:", error);
    throw new Error("Failed to save navigation");
  }
}
