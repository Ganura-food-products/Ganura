import { UpdateProduct, DeleteProduct } from "@/app/ui/products/buttons";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { fetchFilteredProducts } from "@/app/lib/data";

export default async function InvoicesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const products = await fetchFilteredProducts(query, currentPage);
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const isUser = session?.role === "user";
  const isAcc = session?.role === "accountant"
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {products?.map((invoice) => (
              <div
                key={invoice.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 gap-4 flex items-center">
                      {/* <Image
                        src={invoice.image_url}
                        className="mr-2 rounded-full"
                        width={28}
                        height={28}
                        alt={`${invoice.name}'s profile picture`}
                      /> */}
                      <p>{invoice.name}</p>
                      <div className="flex justify-end gap-3">
                        <UpdateProduct id={invoice.id} />
                        {!(isUser ||isAcc) && <DeleteProduct id={invoice.id} />}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      sale-price : {invoice.sale_unit_price}
                    </p>
                    <p className="text-sm text-gray-500">
                      purchase-price : {invoice.purchase_unit_price}
                    </p>
                  </div>
                  {/* <InvoiceStatus status={invoice.status} /> */}
                </div>
                {/* <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {formatCurrency(invoice.amount)}
                    </p>
                    <p>{formatDateToLocal(invoice.date)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateInvoice id={invoice.id} />
                    <DeleteInvoice id={invoice.id} />
                  </div>
                </div> */}
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Product Name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Purchase Price(RWF)
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Sale Price(RWF)
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Unit
                </th>

                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {products?.map((product) => (
                <tr
                  key={product.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap px-3 py-3">
                    {product.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    RWF {product.purchase_unit_price.toLocaleString("en-US")}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    RWF {product.sale_unit_price.toLocaleString("en-US")}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3">
                    {product.unit}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateProduct id={product.id} />
                      {!(isUser || isAcc) && <DeleteProduct id={product.id} />}
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
