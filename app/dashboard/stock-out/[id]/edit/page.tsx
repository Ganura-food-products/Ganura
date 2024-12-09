import Form from '@/app/ui/farmers/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import {
  fetchCustomers,
  fetchFarmerById,
  fetchInvoiceById,
  fetchLeaders,
} from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [farmer, leaders] = await Promise.all([
    fetchFarmerById(id),
    fetchLeaders(),
  ]);
  if (!farmer) {
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Farmers', href: '/dashboard/farmers' },
          {
            label: 'Edit Farmer',
            href: `/dashboard/farmers/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form farmer={farmer} leaders={leaders} />
    </main>
  );
}
