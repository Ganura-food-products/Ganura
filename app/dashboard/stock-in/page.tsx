import Pagination from '@/app/ui/stock-in/pagination';
import Search from '@/app/ui/searchWithDate';
import Table from '@/app/ui/stock-in/table';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import {
  fetchFarmersPages,
  fetchFilteredGoods,
  fetchGoodsPages,
  fetchSeasons,
} from '@/app/lib/data';
import { Metadata } from 'next';
import { CreateStock } from '@/app/ui/stock-in/buttons';
export const metadata: Metadata = {
  title: ' Goods',
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    from?: string;
    to?: string;
    page?: string;
    seasonId?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const from = searchParams?.from || '';
  const to = searchParams?.to || '';
  const seasonId = searchParams?.seasonId || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchGoodsPages(query);
  const seasons = await fetchSeasons();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Available Stock</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search Stock..." seasons={seasons} />
        <CreateStock />
      </div>
      <Suspense
        key={query + currentPage + seasonId}
        fallback={<InvoicesTableSkeleton />}
      >
        <Table
          query={query}
          currentPage={currentPage}
          from={from}
          to={to}
          seasonId={seasonId}
        />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
