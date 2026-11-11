import { getCustomers } from "@/lib/store";
import AdminCustomersView from "@/components/AdminCustomersView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fichier Clientes | Administration YDM Coiffure",
};

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return <AdminCustomersView initialCustomers={customers} />;
}
