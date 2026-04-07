import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/analyze", "/history", "/settings", "/team", "/starred", "/analytics", "/contracts/"],
      },
    ],
    sitemap: "https://the-curator-virid.vercel.app/sitemap.xml",
  };
}
