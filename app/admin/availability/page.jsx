import { getAvailabilities, getUnavailabilities } from "@/lib/store";
import AdminAvailabilityView from "@/components/AdminAvailabilityView";

export const metadata = {
  title: "Horaires & Disponibilités | Administration YDM Coiffure",
};

export default async function AdminAvailabilityPage() {
  const [availabilities, unavailabilities] = await Promise.all([
    getAvailabilities(),
    getUnavailabilities(),
  ]);

  return (
    <AdminAvailabilityView
      initialAvailabilities={availabilities}
      initialUnavailabilities={unavailabilities}
    />
  );
}
