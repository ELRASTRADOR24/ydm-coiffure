import { getBookings, getSettings } from "@/lib/store";
import { getResolvedMaintenance } from "@/lib/siteContent";
import AdminDashboardView from "@/components/AdminDashboardView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tableau de Bord | Administration YDM Coiffure",
};

export default async function AdminDashboardPage() {
  const [bookings, settings] = await Promise.all([
    getBookings(),
    getSettings(),
  ]);

  return (
    <AdminDashboardView
      initialBookings={bookings}
      initialMaintenance={getResolvedMaintenance(settings)}
    />
  );
}
