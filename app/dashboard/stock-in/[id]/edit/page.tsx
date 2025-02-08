import Form from '@/app/ui/stock-in/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import {

  fetchFarmers,
 
  fetchGoodsById,
  fetchProducts,
  
} from '@/app/lib/data';
import { notFound } from 'next/navigation';
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [ good, farmers, products ] = await Promise.all([
    fetchGoodsById(id),
    fetchFarmers(),
    fetchProducts(),
  ])
  
  if (!good) {
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'stock-in', href: '/dashboard/stock-in' },
          {
            label: 'Edit stock-in',
            href: `/dashboard/stock-in/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form good={good} farmers={farmers} products={products}/>
    </main>
  );
}
