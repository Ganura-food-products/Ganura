import Form from '@/app/ui/seasons/edit-form';
import Breadcrumbs from '@/app/ui/seasons/breadcrumbs';
import { fetchSeasonById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Season',
};

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [season] = await Promise.all([fetchSeasonById(id)]);

  if (!season) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Seasons', href: '/dashboard/seasons' },
          {
            label: 'Edit Season',
            href: `/dashboard/seasons/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form season={season} />
    </main>
  );
}
