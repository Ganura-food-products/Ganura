import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchFarmers, fetchInvoiceById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
export const fetchCache = 'force-no-store';
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [invoice, farmers] = await Promise.all([
    fetchInvoiceById(id),
    fetchFarmers(),
  ]);
  if (!invoice) {
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} farmers={farmers} />
    </main>
  );
}
