export const BRAND_NAME = "AmplifyWorld" as const;

export const SERVICES = [
  { id: "performance", title: "Meta Ads & Performance Marketing" },
  { id: "local", title: "Google Business Profile Optimization" },
  { id: "website", title: "Growth-Focused Website Development" },
  { id: "seo-geo", title: "SEO & GEO Optimization" },
  { id: "agentic-ai", title: "Agentic AI for Web" },
  { id: "social", title: "Social Media Management" }
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];
export type HealthResponse = { service: "amplifyworld-api"; status: "ok" };
