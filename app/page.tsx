import Hero from "@/components/Hero";
import MarketContext from "@/components/MarketContext";
import TSGDifference from "@/components/TSGDifference";
import Services from "@/components/Services";
import ByTheNumbers from "@/components/ByTheNumbers";
import WaterExpertise from "@/components/WaterExpertise";
import OpsMonitor from "@/components/OpsMonitor";
import HowWeEngage from "@/components/HowWeEngage";
import ContactForm from "@/components/ContactForm";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <main>
      <Hero />
      <MarketContext />
      <TSGDifference />
      <Services />
      <ByTheNumbers />
      <OpsMonitor />
      <WaterExpertise />
      <HowWeEngage />
      <ContactForm />
      <SiteFooter />
    </main>
  );
}
