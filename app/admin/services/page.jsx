import { getServices } from "@/lib/store";
import AdminServicesView from "@/components/AdminServicesView";

export const metadata = {
  title: "Gestion des Prestations | Administration YDM Coiffure",
};

export default async function AdminServicesPage() {
  const services = await getServices(false);

  return <AdminServicesView initialServices={services} />;
}
