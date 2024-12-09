import { PencilIcon, PlusIcon, TrashIcon, ArrowDownOnSquareIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteSales } from '@/app/lib/actions';

export function CreateSale() {
  return (
    <Link
      href="/dashboard/stock-out/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Sale</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/stock-out/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteSale({ id }: { id: string }) {
  const deleteSaleWithId = deleteSales.bind(null, id);
  return (
    <form action={deleteSaleWithId}>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}

export function DownloadGoods() {
  // const downloadGoodsWithId = downloadGoods.bind(null, id);
  return (
    <form>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Download</span>
        <ArrowDownOnSquareIcon className="w-5" />
      </button>
    </form>
  );
}