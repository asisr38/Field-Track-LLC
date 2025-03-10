import Hero from "@/app/components/Hero";
import About from "@/app/components/About";
import Services from "@/app/components/Services";
import Process from "@/app/components/Process";
import Testimonials from "@/app/components/Testimonials";
import Contact from "@/app/components/Contact";
import WhyChooseUs from "@/app/components/WhyChooseUs";
import SampleReport from "@/app/components/SampleReport";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      {/* <SampleReport /> */}
      <Process />
      <WhyChooseUs />
      <About />
      {/* <Testimonials /> */}
      <Contact />
    </main>
  );
}
