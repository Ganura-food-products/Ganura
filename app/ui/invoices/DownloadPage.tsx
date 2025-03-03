"use client";
import { TableCellsIcon } from "@heroicons/react/24/outline";

import * as XLSX from "xlsx";
import { InvoicesTable } from "@/app/lib/definitions";
import { formatCurrency } from "@/app/lib/utils";

export function DownloadPage({ invoices }: { invoices: InvoicesTable[] }) {
  const handleDownload = () => {
    const invoiceNumber = `INV-${Math.floor(Math.random() * 10000)}`;
    const fileName = `Invoicess_${invoiceNumber}.xlsx`;
    const tableData = invoices.map((item) => ({
      Supplier: item.name,
      Email: item.email,
      Telephone: item.phone_number,
      Status: item.status,
      Amount: formatCurrency(item.amount),
      Date: item.date ? new Date(item.date).toLocaleDateString() : "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice report");
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
