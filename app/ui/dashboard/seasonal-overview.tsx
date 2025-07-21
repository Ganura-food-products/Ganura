import { lusitana } from '@/app/ui/fonts';
import { fetchSeasonalOverview } from '@/app/lib/data';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

export default async function SeasonalOverview({
  seasonId,
}: {
  seasonId?: string;
}) {
  if (!seasonId || seasonId === '') {
    return (
      <div className="w-full bg-gray-50 p-6 rounded-lg">
        <h2 className={`${lusitana.className} mb-4 text-xl`}>
          Seasonal Overview
        </h2>
        <p className="text-gray-500">
          Select a season to view detailed analytics
        </p>
      </div>
    );
  }

  const seasonalData = await fetchSeasonalOverview(seasonId);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6">
      <h2 className={`${lusitana.className} mb-4 text-xl`}>
        {seasonalData.seasonName} Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Farmers in Season */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Farmers</p>
              <p className="text-2xl font-bold text-blue-900">
                {seasonalData.totalFarmers}
              </p>
            </div>
            <div className="text-blue-600">
              {seasonalData.farmersGrowth > 0 ? (
                <ArrowUpIcon className="h-5 w-5" />
              ) : (
                <ArrowDownIcon className="h-5 w-5" />
              )}
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {seasonalData.farmersGrowth > 0 ? '+' : ''}
            {seasonalData.farmersGrowth}% from previous season
          </p>
        </div>

        {/* Stock in Season */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">
                Total Stock (KG)
              </p>
              <p className="text-2xl font-bold text-green-900">
                {seasonalData.totalStock.toLocaleString()}
              </p>
            </div>
            <div className="text-green-600">
              {seasonalData.stockGrowth > 0 ? (
                <ArrowUpIcon className="h-5 w-5" />
              ) : (
                <ArrowDownIcon className="h-5 w-5" />
              )}
            </div>
          </div>
          <p className="text-xs text-green-600 mt-1">
            {seasonalData.stockGrowth > 0 ? '+' : ''}
            {seasonalData.stockGrowth}% from previous season
          </p>
        </div>

        {/* Sales in Season */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Sales (KG)</p>
              <p className="text-2xl font-bold text-purple-900">
                {seasonalData.totalSales.toLocaleString()}
              </p>
            </div>
            <div className="text-purple-600">
              {seasonalData.salesGrowth > 0 ? (
                <ArrowUpIcon className="h-5 w-5" />
              ) : (
                <ArrowDownIcon className="h-5 w-5" />
              )}
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-1">
            {seasonalData.salesGrowth > 0 ? '+' : ''}
            {seasonalData.salesGrowth}% from previous season
          </p>
        </div>
      </div>

      {/* Season Period */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Season Period:</span>{' '}
          {seasonalData.startDate} - {seasonalData.endDate}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Days Remaining:</span>{' '}
          {seasonalData.daysRemaining} days
        </p>
      </div>
    </div>
  );
}
