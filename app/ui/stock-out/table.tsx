import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { UpdateInvoice, DeleteSale } from "@/app/ui/stock-out/buttons";

import { fetchFilteredSales } from "@/app/lib/data";
import { DownloadGoods } from "./DownloadGoods";

export default async function InvoicesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const sales = await fetchFilteredSales(query, currentPage);
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const isAcc = session?.role === "accountant"
  const isUser = session?.role === "user";
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {sales?.map((sale) => (
              <div
                key={sale.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>{sale.customer}</p>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">{sale.product}</p>
                    <p className="text-sm text-gray-500">
                      Quantity (Kg) : {sale.quantity}
                    </p>
                    <p>
                      {sale.date
                        ? new Date(sale.date).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateInvoice id={sale.id} />
                    {!(isUser||isAcc) && <DeleteSale id={sale.id} />}
                    <DownloadGoods stock={sale} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Customer
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Product
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Quantity(KG)
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Sale Date
                </th>

                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sales?.map((sale) => (
                <tr
                  key={sale.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap px-3 py-3">
                    {sale.customer}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {sale.product}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {sale.quantity}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3">
                    {sale.date ? new Date(sale.date).toLocaleDateString() : ""}
                  </td>

                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateInvoice id={sale.id} />
                      {!(isUser || isAcc) && <DeleteSale id={sale.id} />}
                      <DownloadGoods stock={sale} />
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
