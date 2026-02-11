"use client";

import { useState, useEffect, useCallback } from "react";
import { SiteContent } from "@/lib/types";

interface ContentManagerProps {
  token: string;
  onToast: (type: "success" | "error", message: string) => void;
}

type SectionKey = "brand" | "hero" | "about" | "contact" | "footer";

const SECTION_META: Record<SectionKey, { label: string; description: string }> = {
  brand: { label: "Brand", description: "Site name shown in the navigation bar" },
  hero: { label: "Hero Section", description: "The large intro area at the top of the homepage" },
  about: { label: "About Section", description: "The about section on the homepage" },
  contact: { label: "Contact Section", description: "Contact section — email and call-to-action" },
  footer: { label: "Footer", description: "Footer text at the bottom of every page. Use {year} for dynamic year." },
};

const FIELD_LABELS: Record<string, string> = {
  name: "Site Name",
  title: "Title",
  titleAccent: "Title Accent (colored word)",
  subtitle: "Subtitle",
  scrollLabel: "Scroll Indicator Label",
  heading: "Heading",
  text: "Text",
  email: "Email Address",
  buttonText: "Button Text",
  subtext: "Subtext",
};

export function ContentManager({ token, onToast }: ContentManagerProps) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(
    new Set<SectionKey>(["hero"])
  );

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      setContent(data.content ?? null);
    } catch {
      onToast("error", "Failed to load content.");
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const updateField = (
    section: SectionKey,
    field: string,
    value: string
  ) => {
    if (!content) return;
    setContent({
      ...content,
      [section]: {
        ...content[section],
        [field]: value,
      },
    });
    setDirty(true);
  };

  const saveAll = async () => {
    if (!content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": token,
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json();
        onToast("error", data.error ?? "Failed to save content.");
        return;
      }

      onToast("success", "Content saved successfully!");
      setDirty(false);
    } catch {
      onToast("error", "Connection failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-14 rounded-lg bg-gray-100 border border-gray-200"
          />
        ))}
      </div>
    );
  }

  const sections: SectionKey[] = ["brand", "hero", "about", "contact", "footer"];

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">
        Edit the text content displayed on your site. Changes are saved to{" "}
        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
          data/content.json
        </code>{" "}
        and take effect immediately.
      </p>

      <div className="space-y-3">
        {sections.map((sectionKey) => {
          const meta = SECTION_META[sectionKey];
          const sectionData = content[sectionKey] as Record<string, string>;
          const isOpen = openSections.has(sectionKey);

          return (
            <div
              key={sectionKey}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden"
            >
              {/* Section header — toggle */}
              <button
                type="button"
                onClick={() => toggleSection(sectionKey)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {meta.label}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {meta.description}
                  </p>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Section fields */}
              {isOpen && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                  {Object.entries(sectionData).map(([field, value]) => {
                    const label = FIELD_LABELS[field] ?? field;
                    const isLong =
                      field === "text" ||
                      field === "subtitle" ||
                      value.length > 80;

                    return (
                      <div key={field}>
                        <label
                          htmlFor={`${sectionKey}-${field}`}
                          className="block text-xs font-medium text-gray-600 mb-1"
                        >
                          {label}
                        </label>
                        {isLong ? (
                          <textarea
                            id={`${sectionKey}-${field}`}
                            value={value}
                            onChange={(e) =>
                              updateField(sectionKey, field, e.target.value)
                            }
                            rows={4}
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                          />
                        ) : (
                          <input
                            id={`${sectionKey}-${field}`}
                            type={field === "email" ? "email" : "text"}
                            value={value}
                            onChange={(e) =>
                              updateField(sectionKey, field, e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save bar */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={saveAll}
          disabled={saving || !dirty}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving && (
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
          Save All Changes
        </button>
        {dirty && (
          <span className="text-xs text-amber-600 font-medium">
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  );
}
