export default function GameCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-gray-700 overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
        <div className="h-10 bg-gray-700 rounded mt-4" />
      </div>
    </div>
  );
}
