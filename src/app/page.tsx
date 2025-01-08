import ChessContent from "@/components/chess-content";
import CourseContent from "@/components/courses-content";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <ChessContent />
      <CourseContent />
      <Footer />
    </>
  );
}
