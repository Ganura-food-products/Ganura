import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { montserrat } from '@/app/ui/fonts';

import { fetchCardData } from '@/app/lib/data';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
  Stock: TruckIcon,
};

export default async function CardWrapper({
  seasonId,
  query,
  from,
  to,
}: {
  seasonId?: string;
  query?: string;
  from?: string;
  to?: string;
}) {
  const {
    totalPaidInvoices,
    totalArea,
    numberOfFarmers,
    totalQuantityBasilicSeedsStock,
    totalQuantityBasilicSeedsSales,
    totalQuantityChiaSeedsStock,
    totalQuantityChiaSeedsSales,
  } = await fetchCardData(seasonId, query, from, to);

  return (
    <>
      <Card
        title="Paid Amount"
        value={totalPaidInvoices}
        type="collected"
        subtitle={seasonId ? 'This Season' : 'All Time'}
      />

      <Card
        title="Available Basilic Seeds(KG)"
        value={(
          totalQuantityBasilicSeedsStock - totalQuantityBasilicSeedsSales
        ).toLocaleString()}
        type="Stock"
        subtitle={seasonId ? 'This Season' : 'All Time'}
      />
      <Card
        title="Available Chia Seeds(KG)"
        value={(
          totalQuantityChiaSeedsStock - totalQuantityChiaSeedsSales
        ).toLocaleString()}
        type="Stock"
        subtitle={seasonId ? 'This Season' : 'All Time'}
      />
      <Card
        title="Total Area(Ha)"
        value={totalArea}
        type="invoices"
        subtitle={seasonId ? 'This Season' : 'All Time'}
      />
      <Card
        title="Total Suppliers"
        value={numberOfFarmers}
        type="customers"
        subtitle={seasonId ? 'This Season' : 'All Time'}
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
  subtitle,
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'customers' | 'pending' | 'collected' | 'Stock';
  subtitle?: string;
}) {
  const Icon = iconMap[type];

  // Color schemes for different card types
  const colorSchemes = {
    collected: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      titleColor: 'text-green-700',
      valueColor: 'text-green-800',
      border: 'border-green-200',
    },
    customers: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-700',
      valueColor: 'text-blue-800',
      border: 'border-blue-200',
    },
    pending: {
      bg: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-700',
      valueColor: 'text-yellow-800',
      border: 'border-yellow-200',
    },
    invoices: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      titleColor: 'text-purple-700',
      valueColor: 'text-purple-800',
      border: 'border-purple-200',
    },
    Stock: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      titleColor: 'text-orange-700',
      valueColor: 'text-orange-800',
      border: 'border-orange-200',
    },
  };

  const scheme = colorSchemes[type];

  return (
    <div
      className={`${scheme.bg} ${scheme.border} rounded-xl border-2 p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className={`${scheme.iconBg} p-2 rounded-lg`}>
              <Icon className={`h-6 w-6 ${scheme.iconColor}`} />
            </div>
          )}
          <div>
            <h3 className={`text-sm font-semibold ${scheme.titleColor}`}>
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <p
          className={`${montserrat.className} text-3xl font-bold ${scheme.valueColor}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
