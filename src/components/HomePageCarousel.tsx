import ImageCarousel from "./ImageCarousel";

// List of images in the public/home-page folder
const homePageImages = [
  "/home-page/cave.jpg",
  "/home-page/plitvice.jpg",
  "/home-page/prague-funny.jpg",
  "/home-page/vienna-concert.jpg",
  "/home-page/vienna.jpg",
  "/home-page/wedding.jpg",
];

export default function HomePageCarousel() {
  return <ImageCarousel images={homePageImages} />;
}
