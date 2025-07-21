'use client';

import { SeasonForm } from '@/app/lib/definitions';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateSeason } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function EditSeasonForm({ season }: { season: SeasonForm }) {
  const initialState = { message: null, errors: {} };
  const updateSeasonWithId = updateSeason.bind(null, season.id);
  const [state, formAction] = useActionState(updateSeasonWithId, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Season Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Season Name
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={season.name}
                placeholder="Enter season name"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="name-error"
              />
              <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <div id="name-error" aria-live="polite" aria-atomic="true">
              {state.errors?.name &&
                state.errors.name.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>

        {/* Start Date */}
        <div className="mb-4">
          <label
            htmlFor="start_date"
            className="mb-2 block text-sm font-medium"
          >
            Start Date
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={season.start_date}
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="start_date-error"
              />
              <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <div id="start_date-error" aria-live="polite" aria-atomic="true">
              {state.errors?.start_date &&
                state.errors.start_date.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>

        {/* End Date */}
        <div className="mb-4">
          <label htmlFor="end_date" className="mb-2 block text-sm font-medium">
            End Date
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="end_date"
                name="end_date"
                type="date"
                defaultValue={season.end_date}
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="end_date-error"
              />
              <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <div id="end_date-error" aria-live="polite" aria-atomic="true">
              {state.errors?.end_date &&
                state.errors.end_date.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>

        {/* Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the season status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="active"
                  name="status"
                  type="radio"
                  value="active"
                  defaultChecked={season.status === 'active'}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  aria-describedby="status-error"
                />
                <label
                  htmlFor="active"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Active
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="inactive"
                  name="status"
                  type="radio"
                  value="inactive"
                  defaultChecked={season.status === 'inactive'}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  aria-describedby="status-error"
                />
                <label
                  htmlFor="inactive"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Inactive
                </label>
              </div>
            </div>
            <div id="status-error" aria-live="polite" aria-atomic="true">
              {state.errors?.status &&
                state.errors.status.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </fieldset>
        <div aria-live="polite" aria-atomic="true">
          {state.message ? (
            <p className="mt-2 text-sm text-red-500">{state.message}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/seasons"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Season</Button>
      </div>
    </form>
  );
}
