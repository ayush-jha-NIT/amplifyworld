import type { MetadataRoute } from "next";
import { absolutePublicUrl, marketingRoutes } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  // Do not expose indexing signals until the canonical production domain is verified.
  return marketingRoutes.flatMap((path) => {
    const url = absolutePublicUrl(path);
    return url ? [{ url, changeFrequency: "monthly" as const, priority: path === "/" ? 1 : 0.7 }] : [];
  });
}
