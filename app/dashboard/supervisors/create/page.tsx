import Form from '@/app/ui/supervisors/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';

export default async function Page() {
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'supervisors', href: '/dashboard/supervisors' },
          {
            label: 'Insert a Team supervisor',
            href: '/dashboard/supervisors/create',
            active: true,
          },
        ]}
      />
      <Form/>
    </main>
  );
}