import { getSettings } from "@/lib/store";
import AdminSiteEditorView from "@/components/AdminSiteEditorView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Éditeur du Site | Administration YDM Coiffure",
  description:
    "Modifiez, masquez ou supprimez tous les textes et pages du site, et activez le mode maintenance.",
};

export default async function AdminSiteEditorPage({ searchParams }) {
  const [settings, params] = await Promise.all([
    getSettings(),
    searchParams || Promise.resolve({}),
  ]);

  return (
    <AdminSiteEditorView
      initialSettings={settings}
      initialTab={params?.tab || "pages"}
    />
  );
}
