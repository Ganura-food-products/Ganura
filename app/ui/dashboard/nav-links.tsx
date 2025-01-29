// "use client";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  CogIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  TruckIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import clsx from "clsx";


export default async function NavLinks() {

  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const isUser = session?.role === "user";
  const isAcc = session?.role === "accountant";
  const links = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    {
      name: "Invoices",
      href: "/dashboard/invoices",
      icon: DocumentDuplicateIcon,
    },
    !isAcc && {
      name: "Stock In",
      href: "/dashboard/stock-in",
      icon: ArrowDownIcon,
    },
    !isAcc && {
      name: "Stock Out",
      href: "/dashboard/stock-out",
      icon: ArrowUpIcon,
    },
    { name: "Customers", href: "/dashboard/customers", icon: UserGroupIcon },
    !isAcc && {
      name: "Suppliers",
      href: "/dashboard/farmers",
      icon: TruckIcon,
    },
    !isAcc && {
      name: "Team Leaders",
      href: "/dashboard/leaders",
      icon: UserGroupIcon,
    },
    !isAcc && {
      name: "Supervisors",
      href: "/dashboard/supervisors",
      icon: ShieldCheckIcon,
    },
    !isAcc && {
      name: "Products",
      href: "/dashboard/products",
      icon: DocumentDuplicateIcon,
    },
    // { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
    !isUser &&
      !isAcc && {
        name: "Users",
        href: "/dashboard/users",
        icon: UserGroupIcon,
      },
  ].filter(Boolean);

  return (
    <>
      {links?.map((link) => {
        if (link) {
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "flex h-[40px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
                // {
                //   "bg-sky-100 text-blue-600": pathname === link.href,
                // }
              )}
            >
              <link.icon className="w-4" />
              <p className="hidden md:block text-sm">{link.name}</p>
            </Link>
          );
        }
      })}
    </>
  );
}
