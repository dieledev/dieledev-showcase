import { readFile } from "fs/promises";
import { join } from "path";
import { put, list } from "@vercel/blob";
import { SiteContent } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const CONTENT_FILE = join(DATA_DIR, "content.json");
const BLOB_KEY = "data/content.json";

let cachedBlobUrl: string | null = null;

export const DEFAULT_CONTENT: SiteContent = {
  brand: {
    name: "dieledev",
  },
  hero: {
    title: "dieledev",
    titleAccent: "showcase",
    subtitle: "Creative development projects\nand digital experiments.",
    scrollLabel: "Our featured works",
  },
  about: {
    heading: "About",
    text: "I'm Jochem — a developer building digital tools, creative experiments, and everything in between. This showcase collects all my active projects in one place.\n\nEvery project starts as a curiosity. Some grow into full products, others stay experiments. All of them teach me something new.",
  },
  contact: {
    heading: "Contact",
    text: "Got a question, an idea, or just want to say hi?",
    email: "hello@dieledev.work",
    buttonText: "hello@dieledev.work",
  },
  footer: {
    text: "© {year} dieledev. All rights reserved.",
    subtext: "Built with Next.js & Tailwind CSS",
  },
};

/** Read content: try Vercel Blob first, fall back to local file, then defaults */
export async function getSiteContent(): Promise<SiteContent> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      if (cachedBlobUrl) {
        try {
          const res = await fetch(cachedBlobUrl, { cache: "no-store" });
          if (res.ok) {
            const stored = (await res.json()) as Partial<SiteContent>;
            return deepMerge(DEFAULT_CONTENT, stored) as SiteContent;
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
          const stored = (await res.json()) as Partial<SiteContent>;
          return deepMerge(DEFAULT_CONTENT, stored) as SiteContent;
        }
      }
    } catch (error) {
      console.error("Blob read failed for content, falling back to local:", error);
    }
  }

  // Fall back to local file
  try {
    const data = await readFile(CONTENT_FILE, "utf-8");
    const stored = JSON.parse(data) as Partial<SiteContent>;
    return deepMerge(DEFAULT_CONTENT, stored) as SiteContent;
  } catch {
    return { ...DEFAULT_CONTENT };
  }
}

/** Save content to Vercel Blob */
export async function saveSiteContent(content: SiteContent): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not configured. Add Vercel Blob storage to your project."
    );
  }

  const blob = await put(BLOB_KEY, JSON.stringify(content, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });

  cachedBlobUrl = blob.url;
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object"
    ) {
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      );
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
