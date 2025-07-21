import CardWrapper, { Card } from '@/app/ui/dashboard/cards';
import StockInChart from '@/app/ui/dashboard/stock-in-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import SeasonalOverview from '@/app/ui/dashboard/seasonal-overview';
import Search from '@/app/ui/searchWithDate';
import { fetchSeasons } from '@/app/lib/data';
import { poppins } from '@/app/ui/fonts';
import { Suspense } from 'react';
import {
  RevenueChartSkeleton,
  LatestInvoicesSkeleton,
  CardSkeleton,
} from '@/app/ui/skeletons';
import { SeasonalOverviewSkeleton } from '@/app/ui/loading-skeletons';

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    from?: string;
    to?: string;
    seasonId?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const from = searchParams?.from || '';
  const to = searchParams?.to || '';
  const seasonId = searchParams?.seasonId || '';
  const seasons = await fetchSeasons();

  // Create unique keys for Suspense boundaries to trigger re-rendering when filters change
  const suspenseKey = `${seasonId}-${from}-${to}-${query}`;

  return (
    <main className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1
            className={`${poppins.className} text-2xl font-bold text-gray-900 md:text-3xl`}
          >
            Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor your agricultural operations and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Dashboard Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <Search placeholder="Filter dashboard data..." seasons={seasons} />
        </div>
      </div>

      {/* Seasonal Overview - Show when season is selected */}
      {seasonId && (
        <div className="bg-white rounded-lg border border-gray-200">
          <Suspense
            key={`seasonal-${suspenseKey}`}
            fallback={<SeasonalOverviewSkeleton />}
          >
            <SeasonalOverview seasonId={seasonId} />
          </Suspense>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense key={`cards-${suspenseKey}`} fallback={<CardSkeleton />}>
          <CardWrapper seasonId={seasonId} query={query} from={from} to={to} />
        </Suspense>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense
            key={`stockin-${suspenseKey}`}
            fallback={<RevenueChartSkeleton />}
          >
            <StockInChart
              seasonId={seasonId}
              query={query}
              from={from}
              to={to}
            />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <Suspense
            key={`invoices-${suspenseKey}`}
            fallback={<LatestInvoicesSkeleton />}
          >
            <LatestInvoices
              seasonId={seasonId}
              query={query}
              from={from}
              to={to}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
