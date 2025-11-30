import { getHomePagePhotos } from "@/lib/azure-storage";
import ImageCarousel from "./ImageCarousel";

export default async function HomePageCarousel() {
  const images = await getHomePagePhotos();
  
  return <ImageCarousel images={images} />;
}
