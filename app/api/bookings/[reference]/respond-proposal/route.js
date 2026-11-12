import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getBookingByReference,
  updateBooking,
  getSettings,
  getBookings,
  getUnavailabilities,
  getAvailabilities,
} from "@/lib/store";
import {
  findManualBookingConflict,
  getEffectiveBookingStatus,
  isValidDateString,
  isValidTimeString,
} from "@/lib/adminHelpers";
import {
  isSpecificSlotAvailable,
  timeToMinutes,
  minutesToTime,
} from "@/lib/availabilityEngine";
import { createDepositCheckoutSession } from "@/lib/stripe";
import {
  sendBookingApprovedPaymentEmail,
  sendProposalAcceptedAdminEmail,
  sendClientCounterProposalAdminEmail,
  sendBookingRequestedCustomerEmail,
  sendBookingCancelledCustomerEmail,
} from "@/lib/email";
import {
  sendBookingApprovedPaymentSms,
  sendProposalAcceptedAdminSms,
  sendClientCounterProposalAdminSms,
  sendBookingRequestedSms,
  sendBookingCancelledSms,
} from "@/lib/sms";

export async function POST(request, { params }) {
  try {
    const { reference } = await params;
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "").trim().toLowerCase();

    if (!["accept", "counter", "decline"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Action invalide." },
        { status: 400 }
      );
    }

    const booking = await getBookingByReference(reference);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Réservation introuvable." },
        { status: 404 }
      );
    }

    const bookingId = booking.id || booking._id?.toString();
    const effectiveStatus = getEffectiveBookingStatus(booking);

    if (
      action === "accept" &&
      effectiveStatus === "PENDING_PAYMENT" &&
      booking.proposalResponse === "ACCEPTED"
    ) {
      return NextResponse.json({
        success: true,
        alreadyAccepted: true,
        message: "Vous avez déjà accepté cette date. Vous pouvez verser votre acompte.",
        booking,
      });
    }

    if (effectiveStatus !== "RESCHEDULE_PROPOSED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cette proposition de date n'est plus en attente (dossier déjà mis à jour ou clôturé).",
        },
        { status: 409 }
      );
    }

    const nowIso = new Date().toISOString();

    // ------------------------------------------------------------------------
    // 1. La cliente ACCEPTE la date proposée par la coiffeuse -> PENDING_PAYMENT
    // ------------------------------------------------------------------------
    if (action === "accept") {
      const targetDate = booking.proposedDate || booking.date;
      const targetStartTime = booking.proposedStartTime || booking.startTime;
      const totalDuration =
        Number(booking.totalDuration || booking.service?.duration) || 60;

      const [unavailabilities, existingBookings, settings] = await Promise.all([
        getUnavailabilities(),
        getBookings({ date: targetDate }),
        getSettings(),
      ]);

      const conflictCheck = findManualBookingConflict({
        date: targetDate,
        startTime: targetStartTime,
        duration: totalDuration,
        existingBookings,
        unavailabilities,
        excludeBookingId: bookingId,
      });

      if (conflictCheck.conflict) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Ce créneau n'est malheureusement plus disponible. Merci de sélectionner une autre date ci-dessous.",
          },
          { status: 409 }
        );
      }

      const holdHours = settings?.paymentHoldHours || 2;
      const holdExpiresAt = new Date(Date.now() + holdHours * 60 * 60 * 1000);
      const checkoutSession = await createDepositCheckoutSession({
        booking,
        request,
      });

      const updated = await updateBooking(bookingId, {
        status: "PENDING_PAYMENT",
        date: targetDate,
        startTime: targetStartTime,
        endTime:
          booking.proposedEndTime ||
          minutesToTime(timeToMinutes(targetStartTime) + totalDuration),
        holdExpiresAt: holdExpiresAt.toISOString(),
        stripeSessionId: checkoutSession.id,
        stripePaymentUrl: checkoutSession.url,
        proposalResponse: "ACCEPTED",
        proposalRespondedAt: nowIso,
      });

      try {
        await Promise.allSettled([
          sendBookingApprovedPaymentEmail(
            updated || booking,
            checkoutSession.url,
            holdHours,
            settings,
            { request }
          ),
          sendBookingApprovedPaymentSms(
            updated || booking,
            checkoutSession.url,
            holdHours,
            { request }
          ),
          sendProposalAcceptedAdminEmail(updated || booking, settings, {
            request,
          }),
          sendProposalAcceptedAdminSms(updated || booking, settings?.phone, {
            request,
          }),
        ]);
      } catch (e) {
        console.warn("Erreur notification acceptation proposition:", e.message);
      }

      revalidatePath("/admin");
      revalidatePath("/admin/bookings");
      revalidatePath("/admin/calendar");
      revalidatePath("/reserver");
      revalidatePath(`/reserver/statut/${reference}`);

      return NextResponse.json({
        success: true,
        action: "accept",
        message:
          "Date validée ! Vous pouvez maintenant régler votre acompte pour bloquer définitivement votre créneau.",
        booking: updated,
      });
    }

    // ------------------------------------------------------------------------
    // 2. La cliente REFUSE cette date & SÉLECTIONNE une autre date -> PENDING_APPROVAL
    // ------------------------------------------------------------------------
    if (action === "counter") {
      const nextDate = String(body.date || "").trim();
      const nextStartTime = String(body.startTime || "").trim();
      const clientNote = String(body.note || body.reason || "").trim().slice(0, 400);

      if (!isValidDateString(nextDate) || !isValidTimeString(nextStartTime)) {
        return NextResponse.json(
          {
            success: false,
            error: "Veuillez sélectionner une nouvelle date et un horaire disponible.",
          },
          { status: 400 }
        );
      }

      if (nextDate === booking.date && nextStartTime === booking.startTime) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Ce créneau correspond déjà à celui proposé. Cliquez sur « Oui, cette date me convient » ou choisissez un autre horaire.",
          },
          { status: 400 }
        );
      }

      const totalDuration =
        Number(booking.totalDuration || booking.service?.duration) || 60;
      const targetDayObj = new Date(`${nextDate}T12:00:00Z`);
      const dayOfWeek = targetDayObj.getUTCDay();

      const [availabilities, unavailabilities, existingBookings, settings] =
        await Promise.all([
          getAvailabilities(),
          getUnavailabilities(),
          getBookings({ date: nextDate }),
          getSettings(),
        ]);

      const weeklyAvailability = availabilities.find(
        (a) => a.dayOfWeek === dayOfWeek
      );

      const isAvailable = isSpecificSlotAvailable({
        dateStr: nextDate,
        startTime: nextStartTime,
        totalDuration,
        weeklyAvailability,
        existingBookings,
        unavailabilities,
        settings,
        excludeBookingId: bookingId,
        now: new Date(),
      });

      if (!isAvailable) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Ce créneau horaire n'est plus disponible pour la durée de votre prestation. Veuillez en sélectionner un autre.",
          },
          { status: 409 }
        );
      }

      const nextEndTime = minutesToTime(
        timeToMinutes(nextStartTime) + totalDuration
      );
      const rejectedProposedDate = booking.proposedDate || booking.date;
      const rejectedProposedTime = booking.proposedStartTime || booking.startTime;

      const updated = await updateBooking(bookingId, {
        status: "PENDING_APPROVAL",
        previousDate: booking.date,
        previousStartTime: booking.startTime,
        previousEndTime: booking.endTime,
        date: nextDate,
        startTime: nextStartTime,
        endTime: nextEndTime,
        holdExpiresAt: null,
        proposalResponse: "COUNTER_PROPOSED",
        proposalRespondedAt: nowIso,
        proposalDeclineReason: clientNote,
      });

      try {
        await Promise.allSettled([
          sendClientCounterProposalAdminEmail(
            updated || booking,
            rejectedProposedDate,
            rejectedProposedTime,
            clientNote,
            settings,
            { request }
          ),
          sendClientCounterProposalAdminSms(
            updated || booking,
            settings?.phone,
            { request }
          ),
          sendBookingRequestedCustomerEmail(updated || booking, settings, {
            request,
          }),
          sendBookingRequestedSms(updated || booking),
        ]);
      } catch (e) {
        console.warn("Erreur notification contre-proposition cliente:", e.message);
      }

      revalidatePath("/admin");
      revalidatePath("/admin/bookings");
      revalidatePath("/admin/calendar");
      revalidatePath("/reserver");
      revalidatePath(`/reserver/statut/${reference}`);

      return NextResponse.json({
        success: true,
        action: "counter",
        message:
          "Votre nouvelle date a bien été transmise à la coiffeuse. Elle va examiner votre choix sous peu !",
        booking: updated,
      });
    }

    // ------------------------------------------------------------------------
    // 3. Annulation définitive par la cliente si elle ne souhaite plus reprogrammer
    // ------------------------------------------------------------------------
    const declineNote = String(body.note || body.reason || "").trim().slice(0, 400);
    const cancellationReason = declineNote
      ? `Proposition déclinée par la cliente : ${declineNote}`
      : "Proposition déclinée par la cliente.";

    const updated = await updateBooking(bookingId, {
      status: "CANCELLED",
      holdExpiresAt: null,
      proposalResponse: "DECLINED",
      proposalRespondedAt: nowIso,
      proposalDeclineReason: declineNote,
      cancellationReason,
    });

    const settings = await getSettings();
    try {
      await Promise.allSettled([
        sendBookingCancelledCustomerEmail(
          updated || booking,
          cancellationReason,
          settings,
          { request }
        ),
        sendBookingCancelledSms(updated || booking, cancellationReason),
      ]);
    } catch (e) {
      console.warn("Erreur notification annulation proposition:", e.message);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/reserver");
    revalidatePath(`/reserver/statut/${reference}`);

    return NextResponse.json({
      success: true,
      action: "decline",
      message: "Votre demande a été annulée et le créneau libéré.",
      booking: updated,
    });
  } catch (error) {
    console.error("Erreur réponse proposition date:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
