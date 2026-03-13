import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      {/* AI Optimization Button Skeleton */}
      <div className="flex flex-col items-center gap-4 py-8 bg-muted/20 rounded-2xl border border-dashed border-primary/10">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-14 w-full max-w-xs rounded-full" />
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-4">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex flex-col gap-2 mt-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-14" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
