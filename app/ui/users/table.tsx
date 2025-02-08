import { fetchFilteredUsers } from "@/app/lib/data";
import { DeleteUser, UpdateUser } from "./buttons";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";

export default async function UsersTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const isUser = session?.role === "user";
  const isAcc = session?.role === "accountant"
  const users = await fetchFilteredUsers(query, currentPage);
  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <div className="md:hidden">
                {users?.map((user) => (
                  <div
                    key={user.id}
                    className="mb-2 w-full rounded-md bg-white p-4"
                  >
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="mb-2 flex items-center">
                          <div className="flex items-center gap-3 justify-between">
                            <p>{user.name}</p>
                            <div className="flex justify-end gap-3">
                              <UpdateUser id={user.id} />
                              {!(isUser||isAcc) && <DeleteUser id={user.id} />}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          <a>{user.email}</a>
                        </p>
                        <p className="text-sm text-gray-500">
                          <a>{user.role}</a>
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between border-b py-5">
                      {/* <div className="flex w-1/2 flex-col">
                        <p className="font-medium">{user.password}</p>
                      </div> */}
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
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Email
                    </th>
                    {/* <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Password
                    </th> */}
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Role/Type
                    </th>
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {users.map((user) => (
                    <tr key={user.id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{user.name}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {user.email}
                      </td>
                      {/* <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {user.password}
                      </td> */}
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {user.role}
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end gap-3">
                          <UpdateUser id={user.id} />
                            {!(isUser || isAcc) && <DeleteUser id={user.id} />}
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
