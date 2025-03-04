import { UpdateInvoice, DeleteGoods } from "@/app/ui/stock-in/buttons";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { fetchFilteredGoodsNew, fetchFilteredGoods } from "@/app/lib/data";
import { DownloadGoods } from "./DownloadGoods";
import { DownloadPage } from "./DownloadPage";

export default async function InvoicesTable({
  query,
  currentPage,
  from,
  to,
}: {
  query: string;
  currentPage: number;
  from: string;
  to: string;
}) {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const isUser = session?.role === "user";
  const isAcc = session?.role === "accountant";
  const stockins = await fetchFilteredGoods(query, currentPage, from, to);
  const stockinsun = await fetchFilteredGoodsNew(query, from, to);
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {stockins?.map((good) => (
              <div
                key={good.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>{good.supplier}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500">{good.product}</p>
                      <p className="text-sm text-gray-500">Quantity (Kg):</p>
                      <p className="text-md text-gray-900">{good.quantity}</p>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p>
                      {" "}
                      {good.date
                        ? new Date(good.date).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateInvoice id={good.id} />
                    {!(isUser || isAcc) && <DeleteGoods id={good.id} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Supplier
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Product
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Telephone
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  District
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Sector
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Quantity(KG)
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>

                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {stockins?.map((stock) => (
                <tr
                  key={stock.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap px-3 py-3">
                    {stock.supplier}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {stock.product}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {stock.phone_number}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {stock.district}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {stock.sector}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {stock.quantity}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3">
                    {" "}
                    {stock.date
                      ? new Date(stock.date).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateInvoice id={stock.id} />
                      {!(isUser || isAcc) && <DeleteGoods id={stock.id} />}
                      <DownloadGoods stock={stock} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-full py-2"><DownloadPage stock={stockinsun}/></div>
      </div>
    </div>
  );
}
