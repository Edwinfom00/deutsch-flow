export default function ReviewLoading() {
  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5 animate-pulse">
      <div className="space-y-1">
        <div className="h-4 w-20 bg-gray-200 rounded-sm" />
        <div className="h-3 w-48 bg-gray-100 rounded-sm" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0,1,2].map(i => (
          <div key={i} className="bg-white border border-gray-100 rounded-md p-4 space-y-2">
            <div className="h-6 w-10 bg-gray-200 rounded-sm" />
            <div className="h-3 w-16 bg-gray-100 rounded-sm" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-100 rounded-md p-6 space-y-4">
        <div className="h-4 w-32 bg-gray-200 rounded-sm" />
        <div className="h-20 bg-gray-100 rounded-md" />
        <div className="space-y-2">
          {[0,1,2].map(i => <div key={i} className="h-10 bg-gray-100 rounded-md" />)}
        </div>
      </div>
    </div>
  );
}
