import { redirect } from "next/navigation";

export default async function ReservationRedirectPage({ params }) {
  const { reference } = await params;
  redirect(`/reserver/statut/${encodeURIComponent(String(reference || ""))}`);
}
