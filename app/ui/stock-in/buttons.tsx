import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  ArrowDownOnSquareIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteGoods } from '@/app/lib/actions';

export function CreateStock() {
  return (
    <Link
      href="/dashboard/stock-in/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Stockin</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/stock-in/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteGoods({ id }: { id: string }) {
  const deleteGoodsWithId = deleteGoods.bind(null, id);
  return (
    <form action={deleteGoodsWithId}>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}

export function DownloadGoods() {
  return (
    <form>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Download</span>
        <ArrowDownOnSquareIcon className="w-5" />
      </button>
    </form>
  );
}
