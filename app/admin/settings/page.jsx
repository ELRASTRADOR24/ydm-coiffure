import { getSettings } from "@/lib/store";
import AdminSettingsView from "@/components/AdminSettingsView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Paramètres du Salon | Administration YDM Coiffure",
};

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return <AdminSettingsView initialSettings={settings} />;
}
