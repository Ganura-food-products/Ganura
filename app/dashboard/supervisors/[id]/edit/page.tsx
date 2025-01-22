import Form from '@/app/ui/supervisors/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchSupervisorById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
export const fetchCache = 'force-no-store';
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [supervisor] = await Promise.all([
    fetchSupervisorById(id)
  ]);
  if (!supervisor) {
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Supervisors', href: '/dashboard/supervisors' },
          {
            label: 'Edit Supervisor',
            href: `/dashboard/supervisors/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form supervisor={supervisor} />
    </main>
  );
}
