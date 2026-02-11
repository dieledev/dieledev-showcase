"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type MediaImage = {
  filename: string;
  url: string;
};

interface MediaLibraryProps {
  token: string;
  currentImage?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function MediaLibrary({
  token,
  currentImage,
  onSelect,
  onClose,
}: MediaLibraryProps) {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<string>(currentImage ?? "");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [tab, setTab] = useState<"library" | "url">("library");
  const [manualUrl, setManualUrl] = useState(
    currentImage?.startsWith("http") ? currentImage : ""
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      setImages(data.images ?? []);
    } catch {
      setError("Failed to load media library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError("");

    // Client-side checks
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size is 5 MB.");
      setUploading(false);
      return;
    }

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowed.includes(file.type)) {
      setError("File type not allowed. Use JPEG, PNG, GIF, WebP, or SVG.");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "X-Admin-Token": token },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }

      // Add to list and auto-select
      setImages((prev) => [data.image, ...prev]);
      setSelected(data.image.url);
    } catch {
      setError("Connection failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDelete = async (filename: string, url: string) => {
    try {
      // Extract just the last segment for the API route
      const shortName = filename.includes("/")
        ? filename.split("/").pop()!
        : filename;

      const res = await fetch(`/api/media/${encodeURIComponent(shortName)}`, {
        method: "DELETE",
        headers: { "X-Admin-Token": token },
      });

      if (res.ok || res.status === 204) {
        setImages((prev) => prev.filter((img) => img.filename !== filename));
        if (selected === url) setSelected("");
      }
    } catch {
      setError("Failed to delete image.");
    }
  };

  const handleConfirm = () => {
    if (tab === "url") {
      if (manualUrl.trim()) onSelect(manualUrl.trim());
    } else {
      if (selected) onSelect(selected);
    }
  };

  const hasSelection =
    tab === "library" ? !!selected : !!manualUrl.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl rounded-xl bg-white shadow-2xl animate-scale-in mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Media Library
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close media library"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setTab("library")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === "library"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Upload / Library
          </button>
          <button
            onClick={() => setTab("url")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === "url"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            External URL
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {tab === "library" ? (
            <>
              {/* Upload zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative mb-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                  dragOver
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-gray-300 bg-gray-50 hover:border-gray-400"
                }`}
              >
                {uploading ? (
                  <div className="flex items-center gap-3">
                    <svg className="h-6 w-6 animate-spin text-indigo-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <svg className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-1">
                      Drag and drop an image here, or{" "}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-400">
                      JPEG, PNG, GIF, WebP, SVG — max 5 MB
                    </p>
                  </>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Image grid */}
              {loading ? (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    No images uploaded yet. Upload your first image above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {images.map((img) => (
                    <div
                      key={img.filename}
                      className="group relative"
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(img.url)}
                        className={`aspect-square w-full overflow-hidden rounded-lg border-2 transition-all ${
                          selected === img.url
                            ? "border-indigo-600 ring-2 ring-indigo-200"
                            : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.filename}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(img.filename, img.url);
                        }}
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                        aria-label={`Delete ${img.filename}`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Selection check */}
                      {selected === img.url && (
                        <div className="absolute top-1 left-1 rounded-full bg-indigo-600 p-0.5 text-white">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* URL tab */
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="external-url"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Image URL
                </label>
                <input
                  id="external-url"
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {manualUrl && (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={manualUrl}
                    alt="Preview"
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.display = "block";
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
          <div className="text-sm text-gray-500">
            {tab === "library" && selected && (
              <span>
                Selected:{" "}
                <span className="font-medium text-gray-700">
                  {selected.split("/").pop()}
                </span>
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!hasSelection}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use Selected Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
