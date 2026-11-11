import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getSettings } from "@/lib/store";
import AdminSidebar from "@/components/AdminSidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Administration | YDM Coiffure",
};

export default async function AdminLayout({ children }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isLoginRoute =
    pathname === "/admin/login" || pathname === "/admin/login/";

  const session = await getAdminSession();
  if (!isLoginRoute && (!session || !["ADMIN", "STAFF"].includes(session.role))) {
    redirect("/admin/login");
  }

  const settings = isLoginRoute
    ? {}
    : await getSettings().catch(() => ({}));

  return (
    <AdminSidebar
      user={session}
      maintenanceEnabled={Boolean(settings?.maintenance?.enabled)}
    >
      {children}
    </AdminSidebar>
  );
}
