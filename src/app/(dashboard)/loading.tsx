export default function DashboardLoading() {
  return (
    <div className="p-5 max-w-6xl mx-auto space-y-5 animate-pulse">

      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="space-y-1.5">
          <div className="h-4 w-36 bg-gray-200 rounded-sm" />
          <div className="h-3 w-24 bg-gray-100 rounded-sm" />
        </div>
        <div className="h-8 w-28 bg-gray-200 rounded-md" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200/70 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-16 bg-gray-100 rounded-sm" />
              <div className="h-6 w-6 bg-gray-100 rounded-md" />
            </div>
            <div className="h-7 w-12 bg-gray-200 rounded-sm" />
            <div className="h-2.5 w-20 bg-gray-100 rounded-sm" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-4">
          {/* XP progress */}
          <div className="bg-white border border-gray-200/70 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-2.5 w-32 bg-gray-100 rounded-sm" />
                <div className="h-4 w-24 bg-gray-200 rounded-sm" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 bg-gray-200 rounded-md" />
                <div className="h-3 w-3 bg-gray-100 rounded-sm" />
                <div className="h-6 w-6 bg-gray-100 rounded-md" />
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-sm" />
          </div>

          {/* Activity */}
          <div className="bg-white border border-gray-200/70 rounded-md p-4 space-y-4">
            <div className="h-2.5 w-40 bg-gray-100 rounded-sm" />
            <div className="flex items-end gap-1.5 h-16">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gray-100 rounded-sm"
                  style={{ height: `${Math.random() * 60 + 20}%` }}
                />
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white border border-gray-200/70 rounded-md p-4 space-y-3">
            <div className="h-2.5 w-28 bg-gray-100 rounded-sm" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-md">
                  <div className="h-8 w-8 bg-gray-100 rounded-md shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-24 bg-gray-200 rounded-sm" />
                    <div className="h-2 w-16 bg-gray-100 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-4">
          {/* Profile */}
          <div className="bg-white border border-gray-200/70 rounded-md p-4 space-y-3">
            <div className="h-2.5 w-20 bg-gray-100 rounded-sm" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="h-2.5 w-12 bg-gray-100 rounded-sm" />
                <div className="h-2.5 w-24 bg-gray-200 rounded-sm" />
              </div>
            ))}
          </div>

          {/* Daily goal */}
          <div className="bg-white border border-gray-200/70 rounded-md p-4 space-y-3">
            <div className="h-2.5 w-28 bg-gray-100 rounded-sm" />
            <div className="h-8 w-16 bg-gray-200 rounded-sm" />
            <div className="h-1.5 bg-gray-100 rounded-sm" />
            <div className="h-2.5 w-20 bg-gray-100 rounded-sm" />
          </div>

          {/* Streak */}
          <div className="bg-white border border-gray-200/70 rounded-md p-4 space-y-3">
            <div className="h-2.5 w-24 bg-gray-100 rounded-sm" />
            <div className="h-8 w-12 bg-gray-200 rounded-sm" />
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 h-1.5 bg-gray-100 rounded-sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
