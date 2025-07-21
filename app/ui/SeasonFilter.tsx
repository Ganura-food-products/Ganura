'use client';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState, useTransition } from 'react';

type Season = {
  id: string;
  name: string;
};

export default function SeasonFilter({ seasons }: { seasons: Season[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const handleSeasonChange = useDebouncedCallback((seasonId: string) => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');

    if (seasonId && seasonId !== '') {
      params.set('seasonId', seasonId);
    } else {
      params.delete('seasonId');
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
      // Reset loading state after a short delay to ensure smooth UX
      setTimeout(() => setIsLoading(false), 500);
    });
  }, 300);

  return (
    <div className="relative">
      <select
        className={`peer block w-full rounded-md border border-gray-200 py-[9px] pl-3 pr-10 text-sm outline-2 placeholder:text-gray-500 ${
          isPending || isLoading ? 'opacity-50 cursor-wait' : ''
        }`}
        onChange={(e) => handleSeasonChange(e.target.value)}
        defaultValue={searchParams.get('seasonId')?.toString() || ''}
        disabled={isPending || isLoading}
      >
        <option value="">All Seasons</option>
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.name}
          </option>
        ))}
      </select>
      {(isPending || isLoading) && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}
