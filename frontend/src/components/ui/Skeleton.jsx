const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl ${className}`} />
);

export const CardSkeleton = () => (
  <div className="card space-y-3">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-32 w-full" />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-10 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const StatSkeleton = () => (
  <div className="card space-y-3">
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-8 w-1/3" />
  </div>
);

export default Skeleton;
