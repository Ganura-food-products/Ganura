// import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchLeaderById, fetchSupervisors } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Form from '@/app/ui/leaders/edit-form';
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [leader, supervisor] = await Promise.all([
    fetchLeaderById(id),
    fetchSupervisors()
  ]);
  if (!leader) {
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'leaders', href: '/dashboard/leaders' },
          {
            label: 'Edit Farmer',
            href: `/dashboard/leaders/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form leader={leader} supervisor={supervisor}/>
    </main>
  );
}
