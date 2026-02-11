import Link from "next/link";
import { Project } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + "…";
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/p/${project.slug}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-lg bg-neutral-900"
    >
      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={project.imageUrl}
        alt={project.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

      {/* Status badge — top right */}
      <div className="absolute top-3 right-3 z-10">
        <StatusBadge status={project.status} />
      </div>

      {/* Content — bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-violet-600/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-lg font-bold text-white leading-tight">
          {project.title}
        </h3>

        <p className="mt-1 text-[13px] text-gray-300 line-clamp-2 leading-relaxed">
          {truncate(project.description, 120)}
        </p>
      </div>
    </Link>
  );
}
