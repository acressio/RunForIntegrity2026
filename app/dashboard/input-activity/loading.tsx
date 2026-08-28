export default function Loading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="card-dark">
        <div className="h-3 w-32 rounded bg-white/10" />
        <div className="mt-2 h-6 w-48 rounded bg-white/10" />
        <div className="mt-8 h-4 rounded-full bg-white/10" />
      </div>
      <div className="card">
        <div className="mb-6 h-6 w-40 rounded bg-white/10" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 rounded bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
