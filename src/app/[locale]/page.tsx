import ChessContent from "@/components/chess-content";
import CourseContent from "@/components/courses-content";
import Footer from "@/components/footer";
import BannerHero from "@/components/banner_hero";
import Navbar from "@/components/navbar";
export default function Home() {
  return (
    <>
      <Navbar />
      <BannerHero />
      <ChessContent />
      <CourseContent />
      <Footer />
    </>
  );
}
