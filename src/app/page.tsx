import HomePageClient from "@/components/HomePageClient";
import HomePageCarousel from "@/components/HomePageCarousel";

export default function Home() {
  return <HomePageClient carouselSlot={<HomePageCarousel />} />;
}
