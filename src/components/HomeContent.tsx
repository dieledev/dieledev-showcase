"use client";

import { useState, useMemo } from "react";
import { Project, ProjectStatus, SiteContent } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";

const ALL_STATUSES: (ProjectStatus | "All")[] = [
  "All",
  "WIP",
  "Live",
  "Archived",
];

export function HomeContent({
  initialProjects,
  content,
}: {
  initialProjects: Project[];
  content: SiteContent;
}) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">(
    "All"
  );

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    initialProjects.forEach((p) => p.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [initialProjects]);

  // Filter projects
  const filtered = useMemo(() => {
    return initialProjects.filter((project) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !project.title.toLowerCase().includes(q) &&
          !project.description.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (selectedTags.size > 0) {
        if (!project.tags.some((t) => selectedTags.has(t))) {
          return false;
        }
      }
      if (statusFilter !== "All" && project.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [initialProjects, search, selectedTags, statusFilter]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 pt-16 overflow-hidden">
        {/* Subtle gradient bg */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.12)_0%,_transparent_70%)]" />

        <div className="relative z-10 max-w-4xl text-center">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white text-glow leading-[0.9]">
            {content.hero.title}{" "}
            {content.hero.titleAccent && (
              <span className="text-violet-500">{content.hero.titleAccent}</span>
            )}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
            {content.hero.subtitle}
          </p>
        </div>

        {/* Scroll indicator */}
        <a
          href="#projects"
          className="absolute bottom-10 flex flex-col items-center gap-2 text-gray-500 hover:text-violet-400 transition-colors"
          aria-label="Scroll to projects"
        >
          <span className="text-[11px] uppercase tracking-[0.2em] font-medium">
            {content.hero.scrollLabel}
          </span>
          <svg
            className="h-5 w-5 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </a>
      </section>

      {/* ─── PROJECTS ─── */}
      <section id="projects" className="mx-auto max-w-7xl px-6 py-20">
        {/* Section header */}
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-10">
          Projects
        </h2>

        {/* Filters row */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              aria-label="Search projects"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Tags + Status */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {allTags.length > 0 && (
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Filter by tags"
              >
                {allTags.map((tag) => {
                  const active = selectedTags.has(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all duration-150 ${
                        active
                          ? "border-violet-500 bg-violet-600 text-white"
                          : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white"
                      }`}
                      aria-pressed={active}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ProjectStatus | "All")
              }
              aria-label="Filter by status"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:w-auto"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-neutral-900">
                  {s === "All" ? "All statuses" : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <svg
              className="h-16 w-16 text-gray-700 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-300">
              No projects found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
              {content.about.heading}
            </h2>
            <div className="text-gray-400 text-lg leading-relaxed whitespace-pre-line">
              {content.about.text}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
              {content.contact.heading}
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              {content.contact.text}
            </p>
            <a
              href={`mailto:${content.contact.email}`}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {content.contact.buttonText}
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-600">
            {content.footer.text.replace("{year}", String(new Date().getFullYear()))}
          </span>
          <span className="text-xs text-gray-700">
            {content.footer.subtext}
          </span>
        </div>
      </footer>
    </>
  );
}
