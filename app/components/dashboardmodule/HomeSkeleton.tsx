import { Skeleton } from "~/components/ui/skeleton";

export function HomeSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-pulse">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-muted/20 shadow-sm min-h-[220px] md:min-h-[auto]">
        <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          {/* Left Content */}
          <div className="z-10 relative max-w-[65%] md:max-w-none flex-1 space-y-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 md:h-12 w-48 md:w-96 rounded-xl" />
              <Skeleton className="h-8 md:h-12 w-32 md:w-64 rounded-xl" />
            </div>
            <Skeleton className="h-4 md:h-6 w-40 md:w-80 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>

          {/* Right Avatar */}
          <div className="absolute -bottom-4 -right-4 md:static md:bottom-auto md:right-auto flex-shrink-0">
            <Skeleton className="w-40 h-40 md:w-64 md:h-64 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-auto rounded-2xl md:rounded-[1.5rem] bg-muted/10 border border-muted/20 p-3 md:p-5 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10">
              <Skeleton className="w-16 h-16 md:w-24 md:h-24 rounded-full" />
            </div>
            <Skeleton className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl mb-2 md:mb-4" />
            <div className="space-y-1 md:space-y-2">
              <Skeleton className="h-6 md:h-8 w-16 md:w-24 rounded-md" />
              <Skeleton className="h-3 md:h-4 w-12 md:w-20 rounded-sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Adventure Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-muted/20 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8 shadow-sm">
        <div className="flex items-start gap-4 md:gap-6 w-full md:w-auto">
          <Skeleton className="h-14 w-14 md:h-20 md:w-20 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2 md:space-y-3">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-6 md:h-8 w-48 md:w-80 rounded-lg" />
            <Skeleton className="h-4 w-40 md:w-64 rounded-md" />
          </div>
        </div>
        <Skeleton className="w-full md:w-48 h-12 md:h-14 rounded-xl" />
      </div>

      {/* Carousel */}
      <div className="min-h-[200px] w-full rounded-[1.5rem] md:rounded-[2rem] bg-muted/10 border border-muted/20 p-4 md:p-6 space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-6 md:h-8 w-48 md:w-64 rounded-lg" />
            <Skeleton className="h-2 w-32 md:w-48 rounded-full" />
          </div>
        </div>
        <div className="h-32 md:h-48 w-full bg-muted/20 rounded-xl md:rounded-2xl" />
      </div>
    </div>
  );
}
