import { HomeHero } from "@/components/home/home-hero";
import { HomeSections } from "@/components/home/home-sections";

export default function Home() {
  return (
    <main className="home-page">
      <HomeHero />
      <HomeSections />
    </main>
  );
}
