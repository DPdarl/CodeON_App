import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent } from "~/components/ui/card";

export function ArticleSkeleton() {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header Close button placeholder */}
      <div className="pt-6 pb-2 px-4 sm:px-6 w-full max-w-5xl mx-auto flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-md" />
      </div>

      <div className="flex-1 w-full overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 min-h-full flex flex-col justify-center">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 sm:h-12 w-3/4 max-w-lg" />
              </div>
              <Skeleton className="h-6 sm:h-7 w-5/6 max-w-2xl" />
            </div>

            <Card className="border-2 shadow-sm">
              <CardContent className="p-5 sm:p-8 space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-11/12" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-full hidden sm:block" />
                <Skeleton className="h-5 w-3/4 hidden sm:block" />
                
                <div className="pt-4">
                  <Skeleton className="h-48 w-full rounded-xl" />
                </div>
              </CardContent>
            </Card>

            <div className="pt-8 flex justify-end">
              <Skeleton className="h-14 w-48 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
