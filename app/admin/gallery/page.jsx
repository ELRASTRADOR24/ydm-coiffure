import { getSettings, getServices } from "@/lib/store";
import AdminGalleryStudioPage from "@/components/AdminGalleryStudioPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Galerie & Vidéos | Administration YDM Coiffure",
  description:
    "Ajoutez des vidéos et photos directement dans la galerie publique depuis votre iPad ou ordinateur.",
};

export default async function AdminGalleryPage() {
  const [settings, services] = await Promise.all([
    getSettings(),
    getServices(),
  ]);

  return <AdminGalleryStudioPage initialSettings={settings} services={services} />;
}
