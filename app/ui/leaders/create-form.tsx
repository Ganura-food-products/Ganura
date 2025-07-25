"use client";

import { CustomerField, LeaderField } from "@/app/lib/definitions";
import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { createLeader, LeaderState } from "@/app/lib/actions";
import { useActionState } from "react";

export default function Form({ supervisor }: { supervisor: LeaderField[] }) {
  const initialState: LeaderState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createLeader, initialState);
  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="fullname" className="mb-2 block text-sm font-medium">
            Enter Fullname
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="fullname"
                name="name"
                type="text"
                placeholder="Enter Fullname"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="fullname-error"
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              <div id="fullname-error" aria-live="polite" aria-atomic="true">
                {state.errors?.name &&
                  state.errors.name.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="id_number" className="mb-2 block text-sm font-medium">
            Enter ID Number
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="id_number"
                name="id_number"
                type="text"
                placeholder="Enter ID Number"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="id_number-error"
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              <div id="id_number-error" aria-live="polite" aria-atomic="true">
                {state.errors?.id_number &&
                  state.errors.id_number.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="phone_number"
            className="mb-2 block text-sm font-medium"
          >
            Enter Phone Number
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="phone_number"
                name="phone_number"
                type="text"
                placeholder="Enter Phone Number"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="phone_number-error"
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              <div
                id="phone_number-error"
                aria-live="polite"
                aria-atomic="true"
              >
                {state.errors?.phone_number &&
                  state.errors.phone_number.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="city" className="mb-2 block text-sm font-medium">
            Enter City
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="city"
                name="city"
                type="text"
                placeholder="Enter City"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="city-error"
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              <div id="city-error" aria-live="polite" aria-atomic="true">
                {state.errors?.city &&
                  state.errors.city.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="district" className="mb-2 block text-sm font-medium">
            Enter District
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="district"
                name="district"
                type="text"
                placeholder="Enter District"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="district-error"
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              <div id="district-error" aria-live="polite" aria-atomic="true">
                {state.errors?.district &&
                  state.errors.district.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="sector" className="mb-2 block text-sm font-medium">
            Enter Sector
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="sector"
                name="sector"
                type="text"
                placeholder="Enter Sector"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="sector-error"
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              <div id="sector-error" aria-live="polite" aria-atomic="true">
                {state.errors?.sector &&
                  state.errors.sector.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="cell" className="mb-2 block text-sm font-medium">
            Enter Cell
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="cell"
                name="cell"
                type="text"
                placeholder="Enter Cell"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="cell-error"
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              <div id="cell-error" aria-live="polite" aria-atomic="true">
                {state.errors?.cell &&
                  state.errors.cell.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="village" className="mb-2 block text-sm font-medium">
            Enter Village
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="village"
                name="village"
                type="text"
                placeholder="Enter Village"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="village-error"
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              <div id="village-error" aria-live="polite" aria-atomic="true">
                {state.errors?.village &&
                  state.errors.village.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose a Field Supervisor
          </label>
          <div className="relative">
            <select
              id="customer"
              name="supervisor_id"
              aria-describedby="supervisor_id-error"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            >
              <option value="" hidden>
                Select a Field Supervisor
              </option>
              {supervisor.map((customer) => (
                <option key={customer.id} value={customer.name}>
                  {customer.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />


            <div id="supervisor_id-error" aria-live="polite" aria-atomic="true">
              {state.errors?.supervisor_id &&
                state.errors.supervisor_id.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/leaders"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Insert a Team Leader</Button>
      </div>
    </form>
  );
}
