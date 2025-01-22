import Form from '@/app/ui/invoices/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchFarmers } from '@/app/lib/data';
export const fetchCache = 'force-no-store';
export default async function Page() {
  const farmers = await fetchFarmers();
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Create Invoice',
            href: '/dashboard/invoices/create',
            active: true,
          },
        ]}
      />
      <Form farmers={farmers} />
    </main>
  );
}