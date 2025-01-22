import Form from '@/app/ui/customers/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';

export const fetchCache = 'force-no-store';
export default async function Page() {


  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Customers', href: '/dashboard/customers' },
          {
            label: 'Insert a customer',
            href: '/dashboard/customers/create',
            active: true,
          },
        ]}
      />
      <Form/>
    </main>
  );
}