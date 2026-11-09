export default function robots() {
  const baseUrl = "https://ydmcoiffure.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/api/*", "/paiement/*"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/api/*", "/paiement/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
