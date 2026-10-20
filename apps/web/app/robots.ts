import type { MetadataRoute } from "next";
import { absolutePublicUrl, siteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  if (!origin) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/contact"],
      // Unreviewed samples and authenticated paths must not be indexed.
      disallow: ["/admin", "/blog", "/portfolio", "/api"]
    },
    sitemap: absolutePublicUrl("/sitemap.xml") ?? undefined,
    host: origin.origin
  };
}
