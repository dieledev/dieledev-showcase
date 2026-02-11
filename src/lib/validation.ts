import { ProjectStatus, ValidationErrors } from "./types";

const VALID_STATUSES: ProjectStatus[] = ["WIP", "Live", "Archived"];

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export function validateProject(
  data: Record<string, unknown>,
  isPartial = false
): ValidationErrors {
  const errors: ValidationErrors = {};

  // Title
  if (!isPartial || data.title !== undefined) {
    const title =
      typeof data.title === "string" ? data.title.trim() : "";
    if (!title) {
      errors.title = "Title is required";
    } else if (title.length < 3) {
      errors.title = "Title must be at least 3 characters";
    } else if (title.length > 100) {
      errors.title = "Title must be at most 100 characters";
    }
  }

  // Description
  if (!isPartial || data.description !== undefined) {
    const desc =
      typeof data.description === "string" ? data.description.trim() : "";
    if (!desc) {
      errors.description = "Description is required";
    } else if (desc.length < 10) {
      errors.description = "Description must be at least 10 characters";
    } else if (desc.length > 2000) {
      errors.description = "Description must be at most 2000 characters";
    }
  }

  // ImageUrl — accepts https:// URLs or local /uploads/ paths
  if (!isPartial || data.imageUrl !== undefined) {
    const url =
      typeof data.imageUrl === "string" ? data.imageUrl.trim() : "";
    if (!url) {
      errors.imageUrl = "Image is required";
    } else if (url.startsWith("/uploads/")) {
      // Local upload path — valid
    } else if (!url.startsWith("https://")) {
      errors.imageUrl = "Image must be an uploaded file or an https:// URL";
    } else if (!isValidUrl(url)) {
      errors.imageUrl = "Invalid URL format";
    }
  }

  // LinkUrl
  if (!isPartial || data.linkUrl !== undefined) {
    const url =
      typeof data.linkUrl === "string" ? data.linkUrl.trim() : "";
    if (!url) {
      errors.linkUrl = "Link URL is required";
    } else if (
      !url.startsWith("http://") &&
      !url.startsWith("https://")
    ) {
      errors.linkUrl = "Link URL must start with http:// or https://";
    } else if (!isValidUrl(url)) {
      errors.linkUrl = "Invalid URL format";
    }
  }

  // Tags
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.tags = "Tags must be an array";
    } else {
      if (data.tags.length > 10) {
        errors.tags = "Maximum 10 tags allowed";
      } else {
        for (const tag of data.tags) {
          if (
            typeof tag !== "string" ||
            tag.trim().length === 0 ||
            tag.trim().length > 20
          ) {
            errors.tags = "Each tag must be 1-20 characters";
            break;
          }
        }
      }
    }
  }

  // Status
  if (!isPartial || data.status !== undefined) {
    if (!VALID_STATUSES.includes(data.status as ProjectStatus)) {
      errors.status = "Status must be WIP, Live, or Archived";
    }
  }

  return errors;
}
