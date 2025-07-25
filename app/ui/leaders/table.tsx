import { fetchFilteredLeaders } from "@/app/lib/data";
import { UpdateFarmer, DeleteFarmer } from "./buttons";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";

export default async function CustomersTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const leaders = await fetchFilteredLeaders(query, currentPage);

  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const isUser = session?.role === "user";
  const isAcc = session?.role === "accountant"
  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <div className="md:hidden">
                {leaders?.map((customer) => (
                  <div
                    key={customer.id}
                    className="mb-2 w-full rounded-md bg-white p-4"
                  >
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="mb-2 flex items-center">
                          <div className="flex items-center gap-3">
                            {/* <Image
                              src={customer.image_url}
                              className="rounded-full"
                              alt={`${customer.name}'s profile picture`}
                              width={28}
                              height={28}
                            /> */}
                            <p>{customer.name} /</p>
                            <div className="flex justify-end gap-3">
                              <UpdateFarmer id={customer.id} />
                              {!(isUser||isAcc) && <DeleteFarmer id={customer.id} />}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-800">
                          {customer.phone_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between border-b py-5">
                      <div className="flex w-1/2 flex-col">
                        <p className="text-xs">supervisor</p>
                        <p className="font-medium">{customer.supervisor_id}</p>
                      </div>
                      {/* <div className="flex w-1/2 flex-col">
                        <p className="text-xs">Paid</p>
                        <p className="font-medium">{customer.total_paid}</p>
                      </div> */}
                    </div>
                    <div className="pt-4 text-sm">
                      {/* <p>{customer.total_invoices} invoices</p> */}
                    </div>
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
                      ID Number
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      District
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Sector
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Field Supervisor
                    </th>

                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {leaders.map((leader) => (
                    <tr key={leader.id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          {/* <Image
                            src="https://picsum.photos/500/500"
                            className="rounded-full"
                            alt={`${leader.name}'s profile picture`}
                            width={28}
                            height={28}
                          /> */}
                          <p>{leader.name}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {leader.phone_number}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {leader.id_number}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {leader.district}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {leader.sector}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {leader.supervisor_id}
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end gap-3">
                          <UpdateFarmer id={leader.id} />
                          {!(isUser||isAcc) && <DeleteFarmer id={leader.id} />}
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
