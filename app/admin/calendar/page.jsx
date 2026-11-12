import {
  getBookings,
  getServices,
  getAvailabilities,
  getUnavailabilities,
  getSettings,
} from "@/lib/store";
import AdminCalendarView from "@/components/AdminCalendarView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Planning & Calendrier | Administration YDM Coiffure",
};

export default async function AdminCalendarPage() {
  const [bookings, services, availabilities, unavailabilities, settings] =
    await Promise.all([
      getBookings(),
      getServices(false),
      getAvailabilities(),
      getUnavailabilities(),
      getSettings(),
    ]);

  return (
    <AdminCalendarView
      initialBookings={bookings}
      services={services}
      initialAvailabilities={availabilities}
      initialUnavailabilities={unavailabilities}
      initialSettings={{
        maxBookingsPerDay: settings?.maxBookingsPerDay ?? 1,
        reopenedDates: settings?.reopenedDates || [],
      }}
    />
  );
}
