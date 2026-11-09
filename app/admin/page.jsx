import { getBookings } from "@/lib/store";
import AdminDashboardView from "@/components/AdminDashboardView";

export const metadata = {
  title: "Tableau de Bord | Administration YDM Coiffure",
};

export default async function AdminDashboardPage() {
  const bookings = await getBookings();

  return <AdminDashboardView initialBookings={bookings} />;
}
