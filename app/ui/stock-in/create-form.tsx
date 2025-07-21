'use client';

import { FarmerField, ProductField, SeasonField } from '@/app/lib/definitions';
import Link from 'next/link';
import {
  CurrencyDollarIcon,
  UserCircleIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { GoodsState, createGoods } from '@/app/lib/actions';
import { useActionState, useState } from 'react';
import { Autocomplete, AutocompleteItem } from '@nextui-org/autocomplete';

export default function Form({
  farmers,
  products,
  seasons,
}: {
  farmers: FarmerField[];
  products: ProductField[];
  seasons: SeasonField[];
}) {
  const initialState: GoodsState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createGoods, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose Farmer
          </label>
          <div className="relative">
            <Autocomplete
              id="supplier"
              aria-describedby="customer-error"
              name="supplier"
              placeholder="Choose farmer"
            >
              {farmers.map((leader) => (
                <AutocompleteItem key={leader.id} value={leader.name}>
                  {leader.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>

            {/* <select
              id="supplier"
              name="supplier"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue=""
              aria-describedby="customer-error"
            >
              <option value="" disabled>
                Select a supplier/farmer
              </option>
              {farmers.map((farmer) => (
                <option key={farmer.id} value={farmer.name}>
                  {farmer.name}
                </option>
              ))}
            </select> */}
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            <div id="customer-error" aria-live="polite" aria-atomic="true">
              {state.errors?.supplier &&
                state.errors.supplier.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="product" className="mb-2 block text-sm font-medium">
            Choose Product
          </label>
          <div className="relative">
            <select
              id="product"
              name="product"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue=""
              aria-describedby="product-error"
            >
              <option value="" disabled>
                Select a Product
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>
            <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            <div id="product-error" aria-live="polite" aria-atomic="true">
              {state.errors?.product &&
                state.errors.product.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="quantity" className="mb-2 block text-sm font-medium">
            Quantity(KG)
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            className="block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            placeholder="Enter Quantity"
            aria-describedby="quantity-error"
          />
          <div id="quantity-error" aria-live="polite" aria-atomic="true">
            {state.errors?.quantity &&
              state.errors.quantity.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="date" className="mb-2 block text-sm font-medium">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            className="block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            aria-describedby="date-error"
          />
          <div id="date-error" aria-live="polite" aria-atomic="true">
            {state.errors?.stock_date &&
              state.errors.stock_date.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Season Selection */}
        <div className="mb-4">
          <label htmlFor="season" className="mb-2 block text-sm font-medium">
            Choose Season
          </label>
          <div className="relative">
            <select
              id="season"
              name="season_id"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue=""
              aria-describedby="season-error"
            >
              <option value="" disabled>
                Select a season
              </option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </select>
            <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            <div id="season-error" aria-live="polite" aria-atomic="true">
              {state.errors?.season_id &&
                state.errors.season_id.map((error: string) => (
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
          href="/dashboard/stock-in"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Stock</Button>
      </div>
    </form>
  );
}
