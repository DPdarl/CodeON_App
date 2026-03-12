import { Skeleton } from "~/components/ui/skeleton";

// A single branch-section skeleton — mimics the collapsed/expanded chapter rows
function BranchSkeleton({ isOpen = false }: { isOpen?: boolean }) {
  return (
    <div className="relative pl-12 pb-8">
      {/* Vertical connector line */}
      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />

      {/* Chapter Number Circle */}
      <Skeleton className="absolute left-0 top-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800" />

      {/* Chapter Card */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Top gradient bar */}
        <Skeleton className="h-1.5 w-full rounded-none bg-gray-200 dark:bg-gray-700" />

        {/* Chapter Header */}
        <div className="p-4 sm:p-5 flex items-start justify-between">
          <div className="flex gap-4 flex-1">
            <Skeleton className="mt-1 w-10 h-10 rounded-lg shrink-0 bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-40 bg-gray-200 dark:bg-gray-800" />
                <Skeleton className="h-5 w-20 rounded-full bg-gray-200 dark:bg-gray-800 hidden sm:block" />
              </div>
              <Skeleton className="h-3 w-56 bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
          <Skeleton className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-800 shrink-0 ml-2 mt-1" />
        </div>

        {/* Expanded quest list (shown for the first/open item) */}
        {isOpen && (
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161b22] p-3">
            <div className="bg-white dark:bg-[#0F172A]/50 rounded-lg p-2 border border-gray-200 dark:border-transparent space-y-0">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 py-3 px-3 border-b border-gray-100 dark:border-gray-800/50 last:border-0"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20 bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-48 bg-gray-200 dark:bg-gray-800" />
                    <Skeleton className="h-3 w-32 bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700 mt-1" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md bg-gray-200 dark:bg-gray-800 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MOBILE/DEFAULT SKELETON ──────────────────────────────────────────────────
export function ClassroomSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-start">
      <div className="w-full max-w-4xl">
        {/* Back Button */}
        <Skeleton className="h-9 w-40 rounded-lg mb-8 bg-gray-200 dark:bg-gray-800" />

        {/* Page Header */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-72 bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-4 w-52 bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Branch sections */}
        <div className="space-y-0">
          <BranchSkeleton isOpen={true} />
          <BranchSkeleton isOpen={false} />
          <BranchSkeleton isOpen={false} />
          <BranchSkeleton isOpen={false} />
        </div>
      </div>
    </div>
  );
}
