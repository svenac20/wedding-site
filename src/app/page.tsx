import HomePageClient from "@/components/HomePageClient";
import HomePageCarousel from "@/components/HomePageCarousel";

export const dynamic = "force-dynamic";

export default function Home() {
  return <HomePageClient carouselSlot={<HomePageCarousel />} />;
}
