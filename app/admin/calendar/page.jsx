import { getBookings, getServices } from "@/lib/store";
import AdminCalendarView from "@/components/AdminCalendarView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Planning & Calendrier | Administration YDM Coiffure",
};

export default async function AdminCalendarPage() {
  const [bookings, services] = await Promise.all([
    getBookings(),
    getServices(false),
  ]);

  return <AdminCalendarView initialBookings={bookings} services={services} />;
}
