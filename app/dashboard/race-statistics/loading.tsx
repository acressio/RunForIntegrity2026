export default function Loading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="card-dark">
        <div className="h-3 w-32 rounded bg-white/10" />
        <div className="mt-2 h-6 w-40 rounded bg-white/10" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded bg-white/10" />
          ))}
        </div>
        <div className="mt-6 h-2.5 rounded-full bg-white/10" />
      </div>
      <div>
        <div className="mb-5 h-6 w-40 rounded bg-gray-200" />
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-dark h-48" />
          ))}
        </div>
      </div>
    </div>
  );
}
