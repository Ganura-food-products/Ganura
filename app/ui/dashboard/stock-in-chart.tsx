import { TruckIcon } from '@heroicons/react/24/outline';
import { lusitana, poppins } from '@/app/ui/fonts';
import { fetchStockIn } from '@/app/lib/data';
import { Revenue } from '@/app/lib/definitions';

// Generate Y-axis labels for quantities (without currency formatting)
const generateQuantityYAxis = (data: Revenue[]) => {
  const yAxisLabels = [];
  const highestRecord = Math.max(...data.map((month) => month.revenue));
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
};

export default async function StockInChart({
  seasonId,
  query,
  from,
  to,
}: {
  seasonId?: string;
  query?: string;
  from?: string;
  to?: string;
}) {
  const stockInData = await fetchStockIn(seasonId, from, to);
  const chartHeight = 350;

  const { yAxisLabels, topLabel } = generateQuantityYAxis(stockInData);

  if (!stockInData || stockInData.length === 0) {
    return (
      <div className="w-full md:col-span-4">
        <h2 className={`${poppins.className} mb-4 text-xl md:text-2xl`}>
          Recent Stock In
        </h2>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="mt-4 text-gray-400 text-center py-8">
            No stock-in data available.
          </p>
        </div>
      </div>
    );
  }

  // Map month numbers to month names
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const formattedData = stockInData.map((item) => ({
    ...item,
    monthName: monthNames[Number(item.month) - 1] || item.month.toString(),
  }));

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${poppins.className} mb-4 text-xl md:text-2xl`}>
        Recent Stock In
      </h2>

      <div className="rounded-xl bg-gray-50 p-4">
        <div className="mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
          {formattedData.map((monthData) => (
            <div
              key={monthData.month}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="w-full rounded-md bg-orange-400 hover:bg-orange-500 transition-colors duration-200"
                style={{
                  height: `${(chartHeight / topLabel) * monthData.revenue}px`,
                }}
              ></div>
              <p className="-rotate-90 text-sm text-gray-400 sm:rotate-0">
                {monthData.monthName}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <TruckIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">Stock received (KG)</h3>
        </div>
      </div>
    </div>
  );
}
