import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import Form from "@/app/ui/users/create-form";

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Users", href: "/dashboard/users" },
          {
            label: "Insert a User",
            href: "/dashboard/users/create",
            active: true,
          },
        ]}
      />
      <Form/>

    </main>
  );
}
