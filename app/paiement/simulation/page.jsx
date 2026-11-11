import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PaymentSimulationPage({ searchParams }) {
  const { ref } = await searchParams;
  if (ref) {
    redirect(`/reserver/statut/${encodeURIComponent(String(ref))}`);
  }
  redirect("/reserver");
}
