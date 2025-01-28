import Form from '@/app/ui/farmers/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchLeaders } from '@/app/lib/data';

export default async function Page() {
  const leaders = await fetchLeaders();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Farmers', href: '/dashboard/farmers' },
          {
            label: 'Insert a Farmer',
            href: '/dashboard/farmers/create',
            active: true,
          },
        ]}
      />
      <Form leaders={leaders} />
    </main>
  );
}
