import Form from '@/app/ui/stock-out/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers, fetchFarmers, fetchLeaders, fetchProducts } from '@/app/lib/data';
export const fetchCache = 'force-no-store';
export default async function Page() {
  const customers = await fetchCustomers();
  const products = await fetchProducts();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Stock Out', href: '/dashboard/stock-Out' },
          {
            label: 'Create Sale',
            href: '/dashboard/stock-in/create',
            active: true,
          },
        ]}
      />
      <Form customers={customers} products={products} />
    </main>
  );
}
