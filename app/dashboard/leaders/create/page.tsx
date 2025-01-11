import Form from '@/app/ui/leaders/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchSupervisors } from '@/app/lib/data';
 
export default async function Page() {
  const supervisor = await fetchSupervisors();
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Team Leaders', href: '/dashboard/leaders' },
          {
            label: 'Insert a Team Leader',
            href: '/dashboard/leaders/create',
            active: true,
          },
        ]}
      />
      <Form supervisor={supervisor} />
    </main>
  );
}