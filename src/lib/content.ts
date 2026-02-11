import { readFile, writeFile, mkdir, rename } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { SiteContent } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const CONTENT_FILE = join(DATA_DIR, "content.json");

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

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const data = await readFile(CONTENT_FILE, "utf-8");
    const stored = JSON.parse(data) as Partial<SiteContent>;
    // Merge with defaults so new fields are always present
    return deepMerge(DEFAULT_CONTENT, stored) as SiteContent;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(
        CONTENT_FILE,
        JSON.stringify(DEFAULT_CONTENT, null, 2),
        "utf-8"
      );
      return { ...DEFAULT_CONTENT };
    }
    console.error("Failed to read content:", error);
    throw new Error("Failed to load content");
  }
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const tmpFile = join(DATA_DIR, `.content-${randomUUID()}.tmp`);
    await writeFile(tmpFile, JSON.stringify(content, null, 2), "utf-8");
    await rename(tmpFile, CONTENT_FILE);
  } catch (error) {
    console.error("Failed to save content:", error);
    throw new Error("Failed to save content");
  }
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
