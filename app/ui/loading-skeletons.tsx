// Loading skeleton for seasonal overview
export function SeasonalOverviewSkeleton() {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-4">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Farmers card skeleton */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="h-5 w-5 bg-gray-200 rounded"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Stock card skeleton */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-5 w-5 bg-gray-200 rounded"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Sales card skeleton */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-14"></div>
            </div>
            <div className="h-5 w-5 bg-gray-200 rounded"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>

      {/* Season period skeleton */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="h-4 bg-gray-200 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </div>
    </div>
  );
}

// Enhanced card skeleton with multiple cards
export function MultipleCardSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-gray-50 p-2 shadow-sm animate-pulse"
        >
          <div className="flex p-4">
            <div className="h-5 w-5 bg-gray-200 rounded"></div>
            <div className="ml-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="rounded-xl bg-white px-4 py-8">
            <div className="h-8 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
        </div>
      ))}
    </>
  );
}

// Loading overlay for dashboard
export function DashboardLoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-lg flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-gray-700">Updating dashboard...</span>
      </div>
    </div>
  );
}

// Season filter loading indicator
export function SeasonFilterLoading() {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      <span>Loading seasonal data...</span>
    </div>
  );
}
