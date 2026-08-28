export default function Loading() {
  return (
    <div className="animate-pulse space-y-8">
      <div>
        <div className="h-7 w-40 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-64 rounded bg-gray-200" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="card h-40" />
      ))}
    </div>
  );
}
