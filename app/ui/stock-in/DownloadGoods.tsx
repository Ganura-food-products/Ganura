'use client';
import Image from 'next/image';
import { ArrowDownOnSquareIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Logo from '../../../public/ganura.png';

export function DownloadGoods({ stock }: { stock: any }) {
  const handleDownload = () => {
    const doc = new jsPDF();

    doc.addImage(Logo.src, 'PNG', 14, 0, 40, 40, 'logo', 'FAST');

    doc.setFontSize(16);
    doc.text('Reception Note', 14, 40);

    const deliveryNumber = `RN-${Math.floor(Math.random() * 10000)}`;
    doc.setFontSize(12);
    doc.text(`Reception Note #: ${deliveryNumber}`, 14, 50);

    const tableData = [
      ['Supplier', stock.supplier],
      ['Product', stock.product],
      ['Quantity', stock.quantity],
      ['Date', stock.date ? new Date(stock.date).toLocaleDateString() : 'N/A'],
    ];

    autoTable(doc, {
      startY: 60,
      head: [['Field', 'Value']],
      body: tableData,
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text(
      'Ganura Food Products - Thank you for your business!',
      64,
      pageHeight - 10
    );

    // Save PDF
    doc.save(`${stock.supplier}_${deliveryNumber}.pdf`);
  };

  return (
    <button
      onClick={handleDownload}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <span className="sr-only">Download</span>
      <ArrowDownOnSquareIcon className="w-5" />
    </button>
  );
}
