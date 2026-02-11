import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug, getAllProjects } from "@/lib/storage";
import { getNavItems } from "@/lib/navigation";
import { getSiteContent } from "@/lib/content";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [project, navItems, content] = await Promise.all([
    getProjectBySlug(params.slug),
    getNavItems(),
    getSiteContent(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <>
      <Navbar items={navItems} brandName={content.brand.name} />

      <main className="min-h-screen pt-16">
        <div className="mx-auto max-w-4xl px-6 py-12">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-violet-400 transition-colors mb-8"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to projects
          </Link>

          {/* Image */}
          <div className="overflow-hidden rounded-xl border border-white/[0.06]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full max-h-[500px] object-cover"
            />
          </div>

          {/* Header */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {project.title}
            </h1>
            <StatusBadge status={project.status} />
          </div>

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-violet-600/20 border border-violet-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="mt-8 text-gray-300 leading-relaxed whitespace-pre-line text-[15px]">
            {project.description}
          </div>

          {/* CTA */}
          <div className="mt-10">
            <a
              href={project.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
            >
              Open Project
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
