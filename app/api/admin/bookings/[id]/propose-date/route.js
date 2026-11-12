import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import {
  getBookingById,
  updateBooking,
  getSettings,
  getBookings,
  getUnavailabilities,
} from "@/lib/store";
import {
  findManualBookingConflict,
  getEffectiveBookingStatus,
  isValidDateString,
  isValidTimeString,
} from "@/lib/adminHelpers";
import { timeToMinutes, minutesToTime } from "@/lib/availabilityEngine";
import { sendBookingRescheduleProposedEmail } from "@/lib/email";
import { sendBookingRescheduleProposedSms } from "@/lib/sms";

export async function POST(request, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const proposedDate = String(body.date || "").trim();
    const proposedStartTime = String(body.startTime || "").trim();
    const message = String(body.message || body.reason || "").trim().slice(0, 500);

    if (!isValidDateString(proposedDate) || !isValidTimeString(proposedStartTime)) {
      return NextResponse.json(
        {
          success: false,
          error: "Veuillez sélectionner une date et un horaire valides.",
        },
        { status: 400 }
      );
    }

    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Réservation introuvable." },
        { status: 404 }
      );
    }

    const effectiveStatus = getEffectiveBookingStatus(booking);
    if (
      !["PENDING_APPROVAL", "RESCHEDULE_PROPOSED", "PENDING_PAYMENT"].includes(
        effectiveStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de proposer une autre date pour un dossier déjà confirmé, annulé, refusé ou expiré.",
        },
        { status: 409 }
      );
    }

    if (effectiveStatus === "PENDING_PAYMENT" && booking.depositDeclared) {
      return NextResponse.json(
        {
          success: false,
          error:
            "La cliente a déjà déclaré son acompte pour ce créneau. Vérifiez le paiement avant toute modification.",
        },
        { status: 409 }
      );
    }

    if (
      effectiveStatus === "PENDING_APPROVAL" &&
      proposedDate === booking.date &&
      proposedStartTime === booking.startTime
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Choisissez une date ou un horaire différent du créneau demandé, ou validez directement cette demande.",
        },
        { status: 400 }
      );
    }

    const totalDuration =
      Number(booking.totalDuration || booking.service?.duration) || 60;
    const endMinutes = timeToMinutes(proposedStartTime) + Math.round(totalDuration);
    if (endMinutes > 24 * 60) {
      return NextResponse.json(
        {
          success: false,
          error:
            "L'horaire choisi dépasse minuit pour la durée de cette prestation. Choisissez un horaire plus tôt.",
        },
        { status: 400 }
      );
    }
    const proposedEndTime = minutesToTime(endMinutes);

    const [unavailabilities, existingBookings, settings] = await Promise.all([
      getUnavailabilities(),
      getBookings({ date: proposedDate }),
      getSettings(),
    ]);

    const conflictCheck = findManualBookingConflict({
      date: proposedDate,
      startTime: proposedStartTime,
      duration: totalDuration,
      existingBookings,
      unavailabilities,
      excludeBookingId: id,
    });

    if (conflictCheck.conflict) {
      return NextResponse.json(
        {
          success: false,
          error:
            conflictCheck.reason ||
            "Ce créneau chevauche déjà un autre rendez-vous ou une indisponibilité.",
        },
        { status: 409 }
      );
    }

    const nowIso = new Date().toISOString();
    const updated = await updateBooking(id, {
      status: "RESCHEDULE_PROPOSED",
      originalDate: booking.originalDate || booking.date,
      originalStartTime: booking.originalStartTime || booking.startTime,
      originalEndTime: booking.originalEndTime || booking.endTime,
      previousDate: booking.date,
      previousStartTime: booking.startTime,
      previousEndTime: booking.endTime,
      date: proposedDate,
      startTime: proposedStartTime,
      endTime: proposedEndTime,
      proposedDate,
      proposedStartTime,
      proposedEndTime,
      proposalMessage: message,
      proposedAt: nowIso,
      proposalResponse: "",
      proposalRespondedAt: null,
      proposalDeclineReason: "",
      proposalRound: (Number(booking.proposalRound) || 0) + 1,
      holdExpiresAt: null,
    });

    const targetBooking = updated || {
      ...booking,
      status: "RESCHEDULE_PROPOSED",
      previousDate: booking.date,
      previousStartTime: booking.startTime,
      date: proposedDate,
      startTime: proposedStartTime,
      endTime: proposedEndTime,
      proposedDate,
      proposedStartTime,
      proposedEndTime,
      proposalMessage: message,
    };

    try {
      await Promise.allSettled([
        sendBookingRescheduleProposedEmail(targetBooking, message, settings, {
          request,
        }),
        sendBookingRescheduleProposedSms(targetBooking, message, { request }),
      ]);
    } catch (e) {
      console.warn(
        "Erreur envoi notification proposition de date (email/SMS):",
        e.message
      );
    }

    const ref = updated?.bookingReference || booking.bookingReference;
    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/reserver");
    revalidatePath(`/reserver/statut/${ref}`);

    return NextResponse.json({
      success: true,
      message: "Nouvelle date proposée et envoyée à la cliente par e-mail et SMS.",
      booking: updated,
    });
  } catch (error) {
    console.error("Erreur proposition nouvelle date:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
