import { getAdminSession } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export const metadata = {
  title: "Administration | YDM Coiffure",
};

export default async function AdminLayout({ children }) {
  const session = await getAdminSession();

  return (
    <AdminSidebar user={session}>
      {children}
    </AdminSidebar>
  );
}
