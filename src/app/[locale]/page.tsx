import ChessContent from "@/components/chess-content";
import Footer from "@/components/footer";
import BannerHero from "@/components/banner_hero";
import Navbar from "@/components/navbar";
import CommunitySection from "@/components/courses-content";
export default function Home() {
  return (
    <>
      <Navbar />
      <BannerHero />
      <ChessContent />
      <CommunitySection /> {/* Thay thế CourseContent */}
      <Footer />
    </>
  );
}
