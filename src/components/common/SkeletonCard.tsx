import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3 rounded-xl border border-border bg-background p-5', className)}>
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
