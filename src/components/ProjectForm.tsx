"use client";

import { useState } from "react";
import { Project, ProjectStatus, ValidationErrors } from "@/lib/types";
import { MediaLibrary } from "./MediaLibrary";

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: Record<string, unknown>) => Promise<ValidationErrors | null>;
  onCancel: () => void;
  loading: boolean;
  token: string;
}

export function ProjectForm({
  project,
  onSubmit,
  onCancel,
  loading,
  token,
}: ProjectFormProps) {
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [imageUrl, setImageUrl] = useState(project?.imageUrl ?? "");
  const [linkUrl, setLinkUrl] = useState(project?.linkUrl ?? "");
  const [tags, setTags] = useState(project?.tags.join(", ") ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "WIP");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);

  const handleImageSelect = (url: string) => {
    setImageUrl(url);
    setMediaLibraryOpen(false);
    // Clear image error if there was one
    setErrors((prev) => {
      const next = { ...prev };
      delete next.imageUrl;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side pre-validation
    const clientErrors: ValidationErrors = {};
    if (!title.trim()) clientErrors.title = "Title is required";
    else if (title.trim().length < 3)
      clientErrors.title = "Title must be at least 3 characters";
    if (!description.trim())
      clientErrors.description = "Description is required";
    else if (description.trim().length < 10)
      clientErrors.description =
        "Description must be at least 10 characters";
    if (!imageUrl.trim()) clientErrors.imageUrl = "An image is required";
    if (!linkUrl.trim()) clientErrors.linkUrl = "Link URL is required";

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});

    const serverErrors = await onSubmit({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      status,
    });

    if (serverErrors) {
      setErrors(serverErrors);
    }
  };

  const isEditing = !!project;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto py-8">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 animate-fade-in"
          onClick={onCancel}
        />

        {/* Modal */}
        <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-scale-in mx-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Edit Project" : "Add Project"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.title
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="My Awesome Project"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y ${
                  errors.description
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="A brief description of the project (min 10 characters)"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Image — Media Library picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image <span className="text-red-500">*</span>
              </label>

              {imageUrl ? (
                <div className="relative group">
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Selected"
                      className="h-48 w-full object-contain"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMediaLibraryOpen(true)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                    <span className="text-xs text-gray-400 truncate flex-1">
                      {imageUrl.startsWith("/uploads/")
                        ? imageUrl.split("/").pop()
                        : imageUrl}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMediaLibraryOpen(true)}
                  className={`w-full rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
                    errors.imageUrl
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50"
                  }`}
                >
                  <svg
                    className="mx-auto h-8 w-8 text-gray-400 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-600">
                    Choose Image
                  </span>
                  <span className="block text-xs text-gray-400 mt-1">
                    Upload or select from library, or use an external URL
                  </span>
                </button>
              )}
              {errors.imageUrl && (
                <p className="mt-1 text-xs text-red-600">{errors.imageUrl}</p>
              )}
            </div>

            {/* Link URL */}
            <div>
              <label
                htmlFor="linkUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Link URL <span className="text-red-500">*</span>
              </label>
              <input
                id="linkUrl"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.linkUrl
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="https://myproject.com"
              />
              {errors.linkUrl && (
                <p className="mt-1 text-xs text-red-600">{errors.linkUrl}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700"
              >
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.tags
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="react, typescript, api (comma-separated)"
              />
              {errors.tags && (
                <p className="mt-1 text-xs text-red-600">{errors.tags}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as ProjectStatus)
                }
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.status
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
              >
                <option value="WIP">WIP</option>
                <option value="Live">Live</option>
                <option value="Archived">Archived</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-xs text-red-600">{errors.status}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {isEditing ? "Save Changes" : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Media Library modal (renders above the form modal) */}
      {mediaLibraryOpen && (
        <MediaLibrary
          token={token}
          currentImage={imageUrl}
          onSelect={handleImageSelect}
          onClose={() => setMediaLibraryOpen(false)}
        />
      )}
    </>
  );
}
