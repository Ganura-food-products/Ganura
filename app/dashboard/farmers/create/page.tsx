import Form from '@/app/ui/farmers/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchLeaders, fetchSeasons } from '@/app/lib/data';

export default async function Page() {
  const [leaders, seasons] = await Promise.all([
    fetchLeaders(),
    fetchSeasons(),
  ]);

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
      <Form leaders={leaders} seasons={seasons} />
    </main>
  );
}
