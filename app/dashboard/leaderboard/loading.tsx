export default function Loading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="card-dark">
        <div className="h-3 w-28 rounded bg-white/10" />
        <div className="mt-2 h-6 w-44 rounded bg-white/10" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded bg-white/10" />
          ))}
        </div>
      </div>
      <div className="card">
        <div className="mb-4 h-6 w-32 rounded bg-white/10" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 rounded bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
