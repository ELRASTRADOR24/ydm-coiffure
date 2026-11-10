import { getAdminSession } from "@/lib/auth";
import { getSettings } from "@/lib/store";
import AdminSidebar from "@/components/AdminSidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Administration | YDM Coiffure",
};

export default async function AdminLayout({ children }) {
  const [session, settings] = await Promise.all([
    getAdminSession(),
    getSettings().catch(() => ({})),
  ]);

  return (
    <AdminSidebar
      user={session}
      maintenanceEnabled={Boolean(settings?.maintenance?.enabled)}
    >
      {children}
    </AdminSidebar>
  );
}
