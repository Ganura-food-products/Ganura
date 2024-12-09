import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { montserrat } from '@/app/ui/fonts';

import { fetchCardData } from '@/app/lib/data';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default async function CardWrapper() {
  const {
    totalPaidInvoices,
    totalArea,
    numberOfFarmers,
    totalQuantity,
    totalQuantitySales,
  } = await fetchCardData();

  return (
    <>
      <Card title="Unpaid Amount" value={totalPaidInvoices} type="collected" />
      <Card
        title="Available Stock(KG)"
        value={totalQuantity - totalQuantitySales}
        type="pending"
      />
      <Card title="Total Area(Ha)" value={totalArea} type="invoices" />
      <Card title="Total Suppliers" value={numberOfFarmers} type="customers" />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${montserrat.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
