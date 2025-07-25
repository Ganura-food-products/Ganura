import { cookies } from 'next/headers';
import { decrypt } from '@/app/lib/session';
import { fetchFilteredFarmers } from '@/app/lib/data';

import { DeleteFarmer, UpdateFarmer } from './buttons';

export default async function CustomersTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  const isUser = session?.role === 'user';
  const isAcc = session?.role === 'accountant';
  const farmers = await fetchFilteredFarmers(query, currentPage);
  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <div className="md:hidden">
                {farmers?.map((farmer) => (
                  <div
                    key={farmer.id}
                    className="mb-2 w-full rounded-md bg-white p-4"
                  >
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="mb-2 flex items-center">
                          <div className="flex items-center gap-3 justify-between">
                            <p>{farmer.name}</p>
                            <div className="flex justify-end gap-3">
                              <UpdateFarmer id={farmer.id} />
                              {!(isUser || isAcc) && (
                                <DeleteFarmer id={farmer.id} />
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          <a href={`tel:${farmer.phone_number}`}>
                            {farmer.phone_number}
                          </a>
                        </p>
                        <p className="text-sm text-gray-500">
                          Season: {(farmer as any).season_name || 'No Season'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Total Stock: {farmer.total_goods} KG
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between border-b py-5">
                      <div className="flex w-1/2 flex-col">
                        <p className="font-medium">{farmer.team_leader_id}</p>
                      </div>
                      <div className="flex w-1/2 flex-col"></div>
                    </div>
                    <div className="pt-4 text-sm"></div>
                  </div>
                ))}
              </div>
              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Phone Number
                    </th>

                    <th scope="col" className="px-3 py-5 font-medium">
                      District
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Sector
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Area
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Team Leader
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Field Supervisor
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Season
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Provided Stock(KG)
                    </th>
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {farmers.map((farmer) => (
                    <tr key={farmer.id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{farmer.name}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {farmer.phone_number}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {farmer.district}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {farmer.sector}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {farmer.area}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {farmer.team_leader_id}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {farmer.field_supervisor}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {(farmer as any).season_name || 'No Season'}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {farmer.total_goods}
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end gap-3">
                          <UpdateFarmer id={farmer.id} />
                          {!(isUser || isAcc) && (
                            <DeleteFarmer id={farmer.id} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
