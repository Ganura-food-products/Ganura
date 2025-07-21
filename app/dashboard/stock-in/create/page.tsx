import Form from '@/app/ui/stock-in/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import {
  fetchFarmers,
  fetchLeaders,
  fetchProducts,
  fetchSeasons,
} from '@/app/lib/data';
export default async function Page() {
  const [farmers, products, seasons] = await Promise.all([
    fetchFarmers(),
    fetchProducts(),
    fetchSeasons(),
  ]);

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
      <Form farmers={farmers} products={products} seasons={seasons} />
    </main>
  );
}
