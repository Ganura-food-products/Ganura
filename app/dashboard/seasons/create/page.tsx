import Form from '@/app/ui/seasons/create-form';
import Breadcrumbs from '@/app/ui/seasons/breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Season',
};

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Seasons', href: '/dashboard/seasons' },
          {
            label: 'Create Season',
            href: '/dashboard/seasons/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}
