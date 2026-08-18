import { EasterEgg } from "@/components/EasterEgg";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Honesty } from "@/components/Honesty";
import { HowItWorks } from "@/components/HowItWorks";
import { SampleBoard } from "@/components/SampleBoard";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SampleBoard />
        <HowItWorks />
        <Honesty />
      </main>
      <Footer />
      <EasterEgg />
    </>
  );
}
