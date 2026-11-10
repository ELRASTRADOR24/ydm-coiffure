import { getSettings } from "@/lib/store";
import AdminEmailsStudioPage from "@/components/AdminEmailsStudioPage";

export const dynamic = "force-dynamic";

export default async function AdminEmailsPage() {
  const settings = await getSettings();
  return <AdminEmailsStudioPage initialSettings={settings} />;
}
