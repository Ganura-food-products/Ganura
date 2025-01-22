import Form from '@/app/ui/stock-in/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchFarmers, fetchLeaders, fetchProducts } from '@/app/lib/data';
export const fetchCache = 'force-no-store';
export default async function Page() {
  const farmers = await fetchFarmers();
  const products = await fetchProducts();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Stock In', href: '/dashboard/stock-in' },
          {
            label: 'Create Stock',
            href: '/dashboard/stock-in/create',
            active: true,
          },
        ]}
      />
      <Form farmers={farmers} products={products} />
    </main>
  );
}
