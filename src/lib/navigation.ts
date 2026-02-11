import { readFile } from "fs/promises";
import { join } from "path";
import { put, list } from "@vercel/blob";
import { NavItem } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const NAV_FILE = join(DATA_DIR, "navigation.json");
const BLOB_KEY = "data/navigation.json";

let cachedBlobUrl: string | null = null;

/** Read nav items: try Vercel Blob first, fall back to local file */
export async function getNavItems(): Promise<NavItem[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      if (cachedBlobUrl) {
        try {
          const res = await fetch(cachedBlobUrl, { cache: "no-store" });
          if (res.ok) {
            const items = (await res.json()) as NavItem[];
            return items.sort((a, b) => a.order - b.order);
          }
        } catch {
          cachedBlobUrl = null;
        }
      }

      const { blobs } = await list({ prefix: BLOB_KEY });
      const blob = blobs.find((b) => b.pathname === BLOB_KEY);
      if (blob) {
        cachedBlobUrl = blob.url;
        const res = await fetch(blob.url, { cache: "no-store" });
        if (res.ok) {
          const items = (await res.json()) as NavItem[];
          return items.sort((a, b) => a.order - b.order);
        }
      }
    } catch (error) {
      console.error("Blob read failed for navigation, falling back to local:", error);
    }
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
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not configured. Add Vercel Blob storage to your project."
    );
  }

  const blob = await put(BLOB_KEY, JSON.stringify(items, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });

  cachedBlobUrl = blob.url;
}
