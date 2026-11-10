import { NextResponse } from "next/server";
import {
  getServiceById,
  getAvailabilities,
  getUnavailabilities,
  getBookings,
  getSettings,
  createBooking,
} from "@/lib/store";
import {
  isSpecificSlotAvailable,
  timeToMinutes,
  minutesToTime,
} from "@/lib/availabilityEngine";
import {
  sendBookingRequestedCustomerEmail,
  sendNewBookingAdminNotification,
} from "@/lib/email";
import {
  sendBookingRequestedSms,
  sendNewBookingAdminSms,
} from "@/lib/sms";

export async function POST(request) {
  try {
    const currentSettings = await getSettings();
    if (currentSettings?.maintenance?.enabled) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Le site est actuellement en maintenance. Les réservations en ligne sont momentanément suspendues.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      serviceId,
      selectedOptions = [],
      date, // YYYY-MM-DD
      startTime, // HH:mm
      customer,
      acceptedTerms,
    } = body;

    // 1. Validation des champs requis
    if (!serviceId || !date || !startTime || !customer) {
      return NextResponse.json(
        { success: false, error: "Tous les champs obligatoires doivent être renseignés." },
        { status: 400 }
      );
    }

    if (!customer.firstName?.trim() || !customer.lastName?.trim()) {
      return NextResponse.json(
        { success: false, error: "Veuillez renseigner votre prénom et votre nom." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customer.email || !emailRegex.test(customer.email.trim())) {
      return NextResponse.json(
        { success: false, error: "Veuillez renseigner une adresse e-mail valide." },
        { status: 400 }
      );
    }

    if (!customer.phone || customer.phone.trim().length < 8) {
      return NextResponse.json(
        { success: false, error: "Veuillez renseigner un numéro de téléphone valide." },
        { status: 400 }
      );
    }

    if (!acceptedTerms) {
      return NextResponse.json(
        { success: false, error: "Vous devez accepter la politique de réservation et d'annulation." },
        { status: 400 }
      );
    }

    // 2. Récupération et vérification de la prestation
    const service = await getServiceById(serviceId);
    if (!service || !service.isActive) {
      return NextResponse.json(
        { success: false, error: "La prestation sélectionnée n'est pas disponible." },
        { status: 404 }
      );
    }

    // 3. Calcul précis du prix et de la durée avec les options
    let totalDuration = service.duration;
    let totalPrice = service.price;
    const validatedOptions = [];

    if (Array.isArray(selectedOptions)) {
      for (const opt of selectedOptions) {
        const priceDiff = Number(opt.priceDiff) || 0;
        const durationDiff = Number(opt.durationDiff) || 0;
        totalPrice += priceDiff;
        totalDuration += durationDiff;
        validatedOptions.push({
          name: opt.name,
          choice: opt.choice,
          priceDiff,
          durationDiff,
        });
      }
    }

    const depositAmount = 10; // Acompte officiel strict de 10 €
    const remainingBalance = Math.max(0, totalPrice - depositAmount);
    const startMin = timeToMinutes(startTime);
    const endMin = startMin + totalDuration;
    const endTime = minutesToTime(endMin);

    // 4. Contrôle atomique anti-collision des créneaux
    const targetDate = new Date(`${date}T12:00:00Z`);
    const dayOfWeek = targetDate.getUTCDay();

    const [availabilities, unavailabilities, existingBookings, settings] =
      await Promise.all([
        getAvailabilities(),
        getUnavailabilities(),
        getBookings({ date }),
        getSettings(),
      ]);

    const weeklyAvailability = availabilities.find(
      (a) => a.dayOfWeek === dayOfWeek
    );

    const isAvailable = isSpecificSlotAvailable({
      dateStr: date,
      startTime,
      totalDuration: 60,
      weeklyAvailability,
      existingBookings,
      unavailabilities,
      settings,
      now: new Date(),
    });

    if (!isAvailable) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ce créneau horaire n'est plus disponible pour la durée totale de votre prestation. Veuillez choisir un autre horaire.",
        },
        { status: 409 }
      );
    }

    // 5. Création de la réservation avec le statut PENDING_APPROVAL
    const newBooking = await createBooking({
      customer: {
        firstName: customer.firstName.trim(),
        lastName: customer.lastName.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        instagram: customer.instagram?.trim() || "",
        notes: customer.notes?.trim() || "",
      },
      service: {
        id: service.id || service._id.toString(),
        name: service.name,
        price: service.price,
        duration: service.duration,
        depositAmount,
      },
      selectedOptions: validatedOptions,
      date,
      startTime,
      endTime,
      totalDuration,
      totalPrice,
      depositAmount,
      remainingBalance,
      status: "PENDING_APPROVAL",
    });

    // 6. Envoi des notifications transactionnelles (Emails & SMS) asynchrones
    try {
      await Promise.allSettled([
        sendBookingRequestedCustomerEmail(newBooking),
        sendNewBookingAdminNotification(newBooking),
        sendBookingRequestedSms(newBooking),
        sendNewBookingAdminSms(newBooking, settings?.phone),
      ]);
    } catch (e) {
      console.warn("Erreur envoi notification e-mail / SMS:", e.message);
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: newBooking.id || newBooking._id,
        bookingReference: newBooking.bookingReference,
        status: newBooking.status,
        date: newBooking.date,
        startTime: newBooking.startTime,
        endTime: newBooking.endTime,
        totalPrice: newBooking.totalPrice,
        depositAmount: newBooking.depositAmount,
        remainingBalance: newBooking.remainingBalance,
      },
    });
  } catch (error) {
    console.error("Erreur création réservation:", error);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue lors de l'enregistrement de votre demande." },
      { status: 500 }
    );
  }
}
