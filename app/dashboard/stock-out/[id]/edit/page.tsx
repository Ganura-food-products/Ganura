import Form from '@/app/ui/stock-out/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import {
  fetchCustomers,
  fetchSaleById,
  fetchProducts,
} from '@/app/lib/data';
import { notFound } from 'next/navigation';
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [sale, customers, products] = await Promise.all([
    fetchSaleById(id),
    fetchCustomers(),
    fetchProducts(),
  ]);
  if (!sale) {
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'sales', href: '/dashboard/stock-out' },
          {
            label: 'Edit sales/stock-out',
            href: `/dashboard/stock-out/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form sale={sale} customers={customers} products={products}/>
      
    </main>
  );
}
