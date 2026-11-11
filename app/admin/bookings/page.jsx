import { getBookings } from "@/lib/store";
import AdminBookingsView from "@/components/AdminBookingsView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Réservations | Administration YDM Coiffure",
};

export default async function AdminBookingsPage() {
  const bookings = await getBookings();

  return <AdminBookingsView initialBookings={bookings} />;
}
