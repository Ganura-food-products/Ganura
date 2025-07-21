'use client';
import * as React from 'react';
import { addDays, format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useDebouncedCallback } from 'use-debounce';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [isLoading, setIsLoading] = React.useState(false);

  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    if (fromParam && toParam) {
      return {
        from: new Date(fromParam),
        to: new Date(toParam),
      };
    }
    return undefined;
  });

  const handleDateChange = useDebouncedCallback(
    (newDate: DateRange | undefined) => {
      setDate(newDate);
      setIsLoading(true);

      const params = new URLSearchParams(searchParams);

      if (newDate?.from) {
        params.set('from', format(newDate.from, 'yyyy-MM-dd'));
      } else {
        params.delete('from');
      }

      if (newDate?.to) {
        params.set('to', format(newDate.to, 'yyyy-MM-dd'));
      } else {
        params.delete('to');
      }

      params.set('page', '1');

      startTransition(() => {
        replace(`${pathname}?${params.toString()}`);
        // Reset loading state after navigation
        setTimeout(() => setIsLoading(false), 500);
      });
    },
    200
  );

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[50px] h-10 justify-center text-left font-normal relative',
              !date && 'text-muted-foreground',
              (isPending || isLoading) && 'opacity-50'
            )}
            disabled={isPending || isLoading}
          >
            {isPending || isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              <CalendarIcon />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
