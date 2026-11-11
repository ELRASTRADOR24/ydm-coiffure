import "./globals.css";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MaintenanceView from "@/components/MaintenanceView";
import { getSettings } from "@/lib/store";
import { buildPublicSettings } from "@/lib/siteContent";
import { DEFAULT_SALON_SETTINGS } from "@/lib/seedData";

export const dynamic = "force-dynamic";

export const metadata = {
  metadataBase: new URL("https://ydmcoiffure.com"),
  title: {
    default: "YDM Coiffure (@ydm_coiffure) | Coiffeuse Afro à La Roche-sur-Yon",
    template: "%s | YDM Coiffure",
  },
  description:
    "YDM Coiffure (@ydm_coiffure) à La Roche-sur-Yon (85000) : coiffeuse afro spécialisée en tresses protectrices soignées. Knotless Braids, Fulani, Boho Braids, vanilles et nattes collées. Réservation simple en ligne sans paiement direct sur le site, validation sous 24h.",
  keywords: [
    "YDM Coiffure",
    "ydmcoiffure.com",
    "@ydm_coiffure",
    "coiffeuse afro la roche-sur-yon",
    "coiffure afro la roche-sur-yon",
    "coiffeuse afro 85000",
    "salon coiffure afro vendee",
    "tresses africaines la roche-sur-yon",
    "knotless braids la roche-sur-yon",
    "fulani braids",
    "boho braids",
    "vanilles",
    "passion twists",
    "cornrows",
    "nattes collees",
    "coiffure protectrice",
    "reservation tresse afro",
  ],
  authors: [{ name: "YDM Coiffure", url: "https://ydmcoiffure.com" }],
  creator: "YDM Coiffure",
  publisher: "YDM Coiffure",
  alternates: {
    canonical: "https://ydmcoiffure.com",
  },
  openGraph: {
    title: "YDM Coiffure (@ydm_coiffure) | Coiffeuse Afro à La Roche-sur-Yon",
    description:
      "Tresses protectrices et coiffures afro haut de gamme à La Roche-sur-Yon : Knotless, Fulani, Boho Braids, vanilles et nattes collées. Prise de rendez-vous simple en ligne.",
    url: "https://ydmcoiffure.com",
    siteName: "YDM Coiffure",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "YDM Coiffure - Coiffeuse Afro à La Roche-sur-Yon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YDM Coiffure (@ydm_coiffure) | Coiffeuse Afro à La Roche-sur-Yon",
    description:
      "Tresses protectrices et coiffure afro à La Roche-sur-Yon. Réservation en ligne avec validation manuelle sous 24h.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HairSalon",
      "@id": "https://ydmcoiffure.com/#salon",
      name: "YDM Coiffure",
      alternateName: ["@ydm_coiffure", "YDM Coiffure La Roche-sur-Yon"],
      url: "https://ydmcoiffure.com",
      logo: "https://ydmcoiffure.com/logo.png",
      image: "https://ydmcoiffure.com/logo.png",
      description:
        "Coiffeuse afro à La Roche-sur-Yon spécialisée dans les tresses protectrices : Knotless, Fulani, Boho Braids, vanilles, passion twists et nattes collées. Prise de rendez-vous en ligne avec validation personnalisée.",
      telephone: "+33600000000",
      priceRange: "€€",
      currenciesAccepted: "EUR",
      paymentAccepted: "Wero, Revolut, PayPal, Espèces",
      address: {
        "@type": "PostalAddress",
        addressLocality: "La Roche-sur-Yon",
        postalCode: "85000",
        addressRegion: "Vendée",
        addressCountry: "FR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 46.6705,
        longitude: -1.4269,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "09:00",
          closes: "20:00",
        },
      ],
      sameAs: ["https://instagram.com/ydm_coiffure"],
    },
    {
      "@type": "WebSite",
      "@id": "https://ydmcoiffure.com/#website",
      url: "https://ydmcoiffure.com",
      name: "YDM Coiffure",
      description:
        "Plateforme officielle de réservation en ligne pour YDM Coiffure (@ydm_coiffure) à La Roche-sur-Yon.",
      publisher: {
        "@id": "https://ydmcoiffure.com/#salon",
      },
      inLanguage: "fr-FR",
    },
  ],
};

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const previewMaintenance = headersList.get("x-preview-maintenance") || "";

  let rawSettings = {};
  try {
    rawSettings = await getSettings();
  } catch (_) {
    rawSettings = {};
  }

  const publicSettings = buildPublicSettings(
    rawSettings,
    DEFAULT_SALON_SETTINGS.galleryItems
  );

  const isAdminRoute = pathname.startsWith("/admin");
  const isMaintenanceMode =
    !isAdminRoute &&
    (Boolean(publicSettings?.maintenance?.enabled) || previewMaintenance === "1");

  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..800;1,400..800&family=Plus+Jakarta+Sans:wght@300..700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-creme text-brun font-sans flex flex-col antialiased"
      >
        {isMaintenanceMode ? (
          <MaintenanceView
            maintenance={publicSettings.maintenance}
            salonName={
              publicSettings?.siteContent?.global?.header?.brandTitle ||
              "YDM COIFFURE"
            }
          />
        ) : (
          <>
            <Navbar initialSettings={publicSettings} />
            <main className="flex-grow">{children}</main>
            <Footer initialSettings={publicSettings} />
          </>
        )}
      </body>
    </html>
  );
}
