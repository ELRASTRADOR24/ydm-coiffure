import { getSettings } from "@/lib/store";
import AdminSiteEditorView from "@/components/AdminSiteEditorView";

export const metadata = {
  title: "Éditeur du Site | Administration YDM Coiffure",
  description: "Modifiez en direct les textes, la FAQ, le pied de page et gérez la visibilité des pages.",
};

export default async function AdminSiteEditorPage() {
  const settings = await getSettings();

  return <AdminSiteEditorView initialSettings={settings} />;
}
