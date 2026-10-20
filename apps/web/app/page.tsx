import type { Metadata } from "next";
import { StructuredData } from "@/components/structured-data";
import { absolutePublicUrl, marketingWebPage } from "@/lib/site";
import { HomeHero } from "@/components/home/home-hero";
import { HomeSections } from "@/components/home/home-sections";

const title = "AmplifyWorld | Business Growth";
const description = "Connected growth strategy, marketing, SEO, GEO, websites and practical AI experiences for businesses.";
const url = absolutePublicUrl("/");
export const metadata: Metadata = {
  title: { absolute: title }, description,
  ...(url ? { alternates: { canonical: url }, openGraph: { title, description, url },
    twitter: { title, description } } : {})
};
const webGraph: Record<string, unknown> | null = url ? {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": url + "#organization",
      name: "AmplifyWorld", url,
      logo: new URL("/design/brand/logo-compact.webp", url).href },
    { "@type": "WebSite", "@id": url + "#website", name: "AmplifyWorld", url,
      publisher: { "@id": url + "#organization" }, inLanguage: "en" },
    { ...marketingWebPage("/", title, description), about: { "@id": url + "#organization" } }
  ]
} : null;
export default function Home() {
  return (
    <main className="home-page">
      <StructuredData data={webGraph} />
      <HomeHero />
      <HomeSections />
    </main>
  );
}
