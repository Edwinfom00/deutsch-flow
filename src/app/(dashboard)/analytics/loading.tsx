export default function Loading() {
  return (
    <div className="p-5 max-w-6xl mx-auto space-y-5 animate-pulse">
      <div className="space-y-1">
        <div className="h-4 w-24 bg-gray-200 rounded-sm" />
        <div className="h-3 w-48 bg-gray-100 rounded-sm" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0,1,2,3].map(i => (
          <div key={i} className="bg-white border border-gray-100 rounded-md p-4 space-y-2">
            <div className="h-3 w-20 bg-gray-100 rounded-sm" />
            <div className="h-7 w-16 bg-gray-200 rounded-sm" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 rounded-md p-4 h-48" />
          <div className="bg-white border border-gray-100 rounded-md p-4 h-56" />
        </div>
        <div className="space-y-4">
          <div className="bg-gray-200 rounded-md h-40" />
          <div className="bg-white border border-gray-100 rounded-md p-4 h-44" />
        </div>
      </div>
    </div>
  );
}
