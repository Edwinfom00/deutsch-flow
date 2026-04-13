export default function LearnLoading() {
  return (
    <div className="p-5 max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-1">
        <div className="h-4 w-16 bg-gray-200 rounded-sm" />
        <div className="h-3 w-48 bg-gray-100 rounded-sm" />
      </div>

      {/* Session card skeleton */}
      <div className="bg-gray-900 rounded-md overflow-hidden">
        <div className="p-6 space-y-3">
          <div className="h-5 w-40 bg-white/10 rounded-md" />
          <div className="h-7 w-48 bg-white/10 rounded-sm" />
          <div className="h-3 w-32 bg-white/5 rounded-sm" />
        </div>
        <div className="grid grid-cols-3 border-t border-white/6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`flex flex-col items-center gap-2 py-4 ${i < 2 ? "border-r border-white/6" : ""}`}>
              <div className="h-4 w-4 bg-white/10 rounded-sm" />
              <div className="h-5 w-8 bg-white/10 rounded-sm" />
              <div className="h-2 w-12 bg-white/5 rounded-sm" />
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/6">
          <div className="h-11 bg-white/10 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-md p-4 space-y-3">
            <div className="h-8 w-8 bg-gray-100 rounded-md" />
            <div className="h-3.5 w-24 bg-gray-200 rounded-sm" />
            <div className="h-2.5 w-32 bg-gray-100 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
