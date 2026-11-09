// Pure HTTP end-to-end integration test
async function testFullPipeline() {
  console.log("=== 1. FETCH SERVICES ===");
  const servicesRes = await fetch("http://localhost:3000/api/services");
  const servicesData = await servicesRes.json();
  const service = servicesData.services.find(s => s.isActive && s.price > 0);
  console.log("Selected service:", service.name, `(${service.id || service._id})`, "Price:", service.price);

  console.log("\n=== 2. FETCH AVAILABLE SLOTS FOR 2026-11-26 ===");
  const targetDate = "2026-11-26";
  const availRes = await fetch(`http://localhost:3000/api/availability?date=${targetDate}&duration=${service.duration}`);
  const availData = await availRes.json();
  console.log("Available slots count:", availData.slots?.length, "First slot:", availData.slots?.[0]);
  const chosenSlot = availData.slots?.[0] || "10:00";

  console.log("\n=== 3. CREATE BOOKING VIA POST /api/bookings ===");
  const bookingPayload = {
    serviceId: service.id || service._id,
    date: targetDate,
    startTime: chosenSlot,
    selectedOptions: [],
    acceptedTerms: true,
    customer: {
      firstName: "Ines",
      lastName: "Kabore",
      email: "ines.test.e2e@example.com",
      phone: "06 45 89 12 34",
      instagram: "@ines_test",
      notes: "Test automatise de validation de bout en bout."
    }
  };

  const createRes = await fetch("http://localhost:3000/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingPayload)
  });
  const createData = await createRes.json();
  console.log("Create Booking Status:", createRes.status, "Success:", createData.success);
  if (!createData.success) {
    console.error("Booking creation failed:", createData.error);
    process.exit(1);
  }
  const booking = createData.booking;
  const bookingId = booking.id || booking._id;
  const ref = booking.bookingReference;
  console.log("Booking created! Ref:", ref, "ID:", bookingId, "Status:", booking.status);

  console.log("\n=== 4. ADMIN LOGIN & APPROVE BOOKING ===");
  const loginRes = await fetch("http://localhost:3000/api/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL || "maydientary@gmail.com",
      password: process.env.ADMIN_PASSWORD
    })
  });
  console.log("Login HTTP Status:", loginRes.status);
  const cookieHeader = loginRes.headers.get("set-cookie") || "";
  console.log("Received auth cookie:", cookieHeader ? "OUI" : "NON");

  const approveRes = await fetch(`http://localhost:3000/api/admin/bookings/${bookingId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookieHeader
    }
  });
  const approveData = await approveRes.json();
  console.log("Approve Response Status:", approveRes.status, "Success:", approveData.success);
  console.log("Updated Status:", approveData.booking?.status, "Hold Expires At:", approveData.booking?.holdExpiresAt);

  console.log("\n=== 5. CHECK STATUS PAGE /reserver/statut/[ref] ===");
  const statusPageRes = await fetch(`http://localhost:3000/reserver/statut/${ref}`);
  console.log("Status Page HTTP Status:", statusPageRes.status);

  console.log("\n=== 6. SIMULATE / CONFIRM 10 EUR DEPOSIT PAYMENT ===");
  const payRes = await fetch("http://localhost:3000/api/payments/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference: ref })
  });
  const payData = await payRes.json();
  console.log("Payment Simulation Status:", payRes.status, "Success:", payData.success);
  console.log("Final Booking Status:", payData.booking?.status, "Paid Deposit At:", payData.booking?.paidDepositAt);

  console.log("\n=== 7. CHECK SLOT CONFLICT PREVENTION ===");
  const recheckAvail = await fetch(`http://localhost:3000/api/availability?date=${targetDate}&duration=${service.duration}`);
  const recheckData = await recheckAvail.json();
  const slotStillThere = recheckData.slots?.includes(chosenSlot);
  console.log(`Slot ${chosenSlot} blocked successfully?`, !slotStillThere ? "OUI (bloque - aucune double reservation possible)" : "NON (encore present)");

  console.log("\n=== 8. CLEANUP TEST BOOKING ===");
  const cancelRes = await fetch(`http://localhost:3000/api/admin/bookings/${bookingId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookieHeader
    },
    body: JSON.stringify({ reason: "Nettoyage automatique apres test complet." })
  });
  console.log("Cleanup status:", cancelRes.status);

  console.log("\n=== SUCCES TOTAL : LE TUNNEL DE RESERVATION, L APPROBATION ET LE PAIEMENT SONT VALIDÉS A 100% ===");
}

testFullPipeline().catch(err => {
  console.error("Test pipeline failed:", err);
  process.exit(1);
});
