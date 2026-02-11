import { ProjectStatus } from "@/lib/types";

const statusConfig: Record<
  ProjectStatus,
  { bg: string; text: string; dot: string }
> = {
  WIP: {
    bg: "bg-amber-500/20 border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  Live: {
    bg: "bg-emerald-500/20 border-emerald-500/30",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  Archived: {
    bg: "bg-gray-500/20 border-gray-500/30",
    text: "text-gray-400",
    dot: "bg-gray-500",
  },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}
