'use client';
import { useDebouncedCallback } from 'use-debounce';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { DatePickerWithRange } from './DatePicker';
import SeasonFilter from './SeasonFilter';

type Season = {
  id: string;
  name: string;
};

export default function Search({
  placeholder,
  seasons,
}: {
  placeholder: string;
  seasons?: Season[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useDebouncedCallback((term) => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
      setTimeout(() => setIsLoading(false), 500);
    });
  }, 300);

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <input
          className={`peer block w-full rounded-lg border-2 border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${
            isPending || isLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-gray-300'
          }`}
          placeholder={placeholder}
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('query')?.toString()}
          disabled={isPending || isLoading}
        />
        {isPending || isLoading ? (
          <div className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 peer-focus:text-blue-600 transition-colors duration-200" />
        )}
      </div>

      {/* Season Filter */}
      {seasons && seasons.length > 0 && (
        <div className="w-full md:w-48">
          <SeasonFilter seasons={seasons} />
        </div>
      )}

      {/* Date Range Picker */}
      <div className="w-full md:w-auto">
        <DatePickerWithRange />
      </div>
    </div>
  );
}
