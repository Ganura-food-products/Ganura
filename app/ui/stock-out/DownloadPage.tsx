"use client";
import { ArrowDownOnSquareIcon } from "@heroicons/react/24/outline";
import { TableCellsIcon } from "@heroicons/react/24/outline";


import * as XLSX from "xlsx";
import { SalesTableType } from "@/app/lib/definitions";

export function DownloadPage({ stock }: { stock: SalesTableType[] }) {
  const handleDownload = () => {
    const invoiceNumber = `INV-${Math.floor(Math.random() * 10000)}`;
    const fileName = `Sales_${invoiceNumber}.xlsx`;

    const tableData = stock.map((item) => ({
      Customer: item.customer,
      Product: item.product,
      Quantity: item.quantity,
      Date: item.date ? new Date(item.date).toLocaleDateString() : 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Report');
    XLSX.writeFile(wb, fileName);
  };
  return (
    <button
      onClick={handleDownload}
      className="flex px-4 text-white items-center rounded-md border p-2 bg-blue-600 "
      title="export excel"
    >
      <span className="hidden md:block">Export Excel</span>
      <TableCellsIcon className="w-5  md:ml-4" />
    </button>
  );
}
