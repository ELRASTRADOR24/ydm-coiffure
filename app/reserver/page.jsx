import { Suspense } from "react";
import {
  getServices,
  getSettings,
  getAvailabilities,
  getUnavailabilities,
  getBookingByReference,
} from "@/lib/store";
import { buildPublicSettings } from "@/lib/siteContent";
import {
  isValidBookingReference,
  normalizeBookingReference,
} from "@/lib/bookingPersistence";
import { DEFAULT_SALON_SETTINGS } from "@/lib/seedData";
import BookingWizard from "@/components/BookingWizard";
import HiddenPageNotice from "@/components/HiddenPageNotice";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Réservation en Ligne | YDM Coiffure",
  description:
    "Réservez votre séance de tresses africaines en ligne en quelques étapes simples. Validation personnalisée et paiement d'acompte sécurisé.",
};

export default async function ReserverPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const queryRef = normalizeBookingReference(resolvedParams?.ref || "");
  const initialSubmittedBooking =
    queryRef && isValidBookingReference(queryRef)
      ? await getBookingByReference(queryRef).catch(() => null)
      : null;

  const [services, rawSettings, availabilities, unavailabilities] =
    await Promise.all([
      getServices(true),
      getSettings(),
      getAvailabilities(),
      getUnavailabilities(),
    ]);

  const initialBookingRules = {
    blockedDates: unavailabilities
      .filter((u) => u.isAllDay)
      .map((u) => u.date),
    closedDayOfWeeks: availabilities
      .filter((w) => !w.isOpen)
      .map((w) => w.dayOfWeek),
    maxDaysInAdvance: rawSettings?.maxDaysInAdvance ?? 60,
    minNoticeHours: rawSettings?.minNoticeHours ?? 24,
    paymentHoldHours: rawSettings?.paymentHoldHours ?? 2,
  };

  const publicSettings = buildPublicSettings(
    rawSettings,
    DEFAULT_SALON_SETTINGS.galleryItems
  );
  const { siteContent, pageVisibility } = publicSettings;

  if (pageVisibility.reserver === false) {
    return <HiddenPageNotice notice={siteContent.global.hiddenPageNotice} />;
  }

  const bookingIntro = siteContent.bookingPage?.intro;

  return (
    <div className="pt-32 pb-24 bg-creme min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {bookingIntro?.visible &&
          (bookingIntro.eyebrow || bookingIntro.title || bookingIntro.subtitle) && (
            <div className="text-center max-w-2xl mx-auto space-y-2">
              {bookingIntro.eyebrow && (
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-champagne-dark">
                  {bookingIntro.eyebrow}
                </p>
              )}
              {bookingIntro.title && (
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brun">
                  {bookingIntro.title}
                </h1>
              )}
              {bookingIntro.subtitle && (
                <p className="text-sm text-brun-muted font-light">
                  {bookingIntro.subtitle}
                </p>
              )}
            </div>
          )}

        <Suspense
          fallback={
            <div className="max-w-md mx-auto text-center py-20">
              <Sparkles className="w-8 h-8 text-champagne mx-auto animate-spin mb-4" />
              <div className="font-serif text-lg text-brun">
                Chargement de l&apos;espace de réservation...
              </div>
            </div>
          }
        >
          <BookingWizard
            initialServices={services}
            initialBookingRules={initialBookingRules}
            initialSubmittedBooking={initialSubmittedBooking}
          />
        </Suspense>
      </div>
    </div>
  );
}
