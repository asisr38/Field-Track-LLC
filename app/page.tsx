import Hero from "@/app/components/Hero";
import About from "@/app/components/About";
import Services from "@/app/components/Services";
import Process from "@/app/components/Process";
import Contact from "@/app/components/Contact";
import WhyChooseUs from "@/app/components/WhyChooseUs";
import WhyResearchMatters from "@/app/components/WhyResearchMatters";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <Process />
      <WhyResearchMatters />
      <WhyChooseUs />
      <About />
      <Contact />
    </main>
  );
}
