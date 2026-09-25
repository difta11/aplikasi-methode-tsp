import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Benefits } from "@/components/landing/Benefits";
import { About } from "@/components/landing/About";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <main id="konten" className="flex-1">
        <Hero />
        <HowItWorks />
        <Benefits />
        <About />
      </main>
      <Footer />
    </>
  );
}
