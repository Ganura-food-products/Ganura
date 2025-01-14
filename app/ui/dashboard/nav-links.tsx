'use client';

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  CogIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  TruckIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Invoices',
    href: '/dashboard/invoices',
    icon: DocumentDuplicateIcon,
  },
  {
    name: 'Stock In',
    href: '/dashboard/stock-in',
    icon: ArrowDownIcon,
  },
  {
    name: 'Stock Out',
    href: '/dashboard/stock-out',
    icon: ArrowUpIcon,
  },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
  { name: 'Suppliers', href: '/dashboard/farmers', icon: TruckIcon },
  { name: 'Team Leaders', href: '/dashboard/leaders', icon: UserGroupIcon },
  {
    name: 'Supervisors',
    href: '/dashboard/supervisors',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Products',
    href: '/dashboard/products',
    icon: DocumentDuplicateIcon,
  },
  // { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
  { name: 'Users', href: '/dashboard/users', icon: UserGroupIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[40px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              }
            )}
          >
            <LinkIcon className="w-4" />
            <p className="hidden md:block text-sm">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
