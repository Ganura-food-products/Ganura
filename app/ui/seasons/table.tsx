import Image from 'next/image';
import { UpdateSeason, DeleteSeason } from '@/app/ui/seasons/buttons';
import { formatDateToLocal } from '@/app/lib/utils';
import { fetchFilteredSeasons } from '@/app/lib/data';

export default async function SeasonsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const seasons = await fetchFilteredSeasons(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {seasons?.map((season) => (
              <div
                key={season.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p className="text-lg font-semibold">{season.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDateToLocal(season.start_date)} -{' '}
                      {formatDateToLocal(season.end_date)}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateSeason id={season.id} />
                    <DeleteSeason id={season.id} />
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      Status: {season.status}
                    </p>
                    <p className="text-sm">
                      Created: {formatDateToLocal(season.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Season Name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Start Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  End Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Created At
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {seasons?.map((season) => (
                <tr
                  key={season.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap px-4 py-3 pl-6">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{season.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(season.start_date)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(season.end_date)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                        season.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {season.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(season.created_at)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateSeason id={season.id} />
                      <DeleteSeason id={season.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
