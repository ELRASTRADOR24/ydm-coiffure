import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getCustomers } from "@/lib/store";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const customers = await getCustomers();
  return NextResponse.json({ success: true, customers });
}
