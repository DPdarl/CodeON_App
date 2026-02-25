import { Skeleton } from "~/components/ui/skeleton";

export function AdventureSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Back Button */}
      <div className="mb-4 md:mb-6">
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      {/* Header: Icon + Title + Subtitle */}
      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
        <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-2xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 md:h-8 w-40 md:w-56" />
          <Skeleton className="h-4 w-52 md:w-72" />
        </div>
      </div>

      {/* Stats Row: icon pills + rank + runtime + hearts */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-14 rounded-full" />
      </div>

      {/* Roadmap Skeleton */}
      <div className="relative w-full">
        {/* Vertical line — left-aligned on mobile, centered on desktop */}
        <div className="absolute top-0 left-8 md:left-1/2 -translate-x-1/2 h-full w-2 bg-muted rounded-full" />

        <div className="relative z-10 flex flex-col gap-10">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="relative w-full h-40 flex items-center">
              {/* Node circle — pinned to left on mobile */}
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                <Skeleton className="w-16 h-16 rounded-full border-4 border-background" />
              </div>

              {/* Card — right of the node on mobile, alternating on desktop */}
              <div
                className={`absolute w-[calc(100%-6rem)] md:w-64 left-20 ${
                  i % 2 === 0
                    ? "md:left-auto md:right-[calc(50%+5rem)]"
                    : "md:left-[calc(50%+5rem)]"
                }`}
              >
                <Skeleton className="h-28 w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
