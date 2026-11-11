import {
  getAvailabilities,
  getUnavailabilities,
  getBookings,
} from "@/lib/store";
import AdminAvailabilityView from "@/components/AdminAvailabilityView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Horaires & Disponibilités | Administration YDM Coiffure",
};

export default async function AdminAvailabilityPage() {
  const [availabilities, unavailabilities, bookings] = await Promise.all([
    getAvailabilities(),
    getUnavailabilities(),
    getBookings(),
  ]);

  return (
    <AdminAvailabilityView
      initialAvailabilities={availabilities}
      initialUnavailabilities={unavailabilities}
      initialBookings={bookings}
    />
  );
}
