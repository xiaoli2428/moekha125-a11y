/**
 * Skeleton loader for pool list
 * Shows while data is loading
 */
export const SkeletonPoolList = () => (
    <div className="animate-pulse space-y-3">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex justify-between items-center">
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-white/10 rounded w-32" />
                        <div className="h-3 bg-white/10 rounded w-24" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-white/10 rounded w-20" />
                        <div className="h-3 bg-white/10 rounded w-16" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);
