export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse">
      <div className="aspect-video w-full bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="h-5 w-14 rounded-full bg-gray-200" />
        </div>
        <div className="flex gap-1">
          <div className="h-5 w-12 rounded bg-gray-100" />
          <div className="h-5 w-16 rounded bg-gray-100" />
          <div className="h-5 w-10 rounded bg-gray-100" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded bg-gray-100" />
          <div className="h-3 w-3/4 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg bg-white p-4 border border-gray-200">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-4 w-16 rounded bg-gray-200" />
          <div className="h-4 w-8 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="ml-auto flex gap-2">
            <div className="h-8 w-16 rounded bg-gray-200" />
            <div className="h-8 w-16 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
