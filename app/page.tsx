import Navbar from "./components/Home/navbar";
import Footer from "./components/Home/footer";
import Features from "./components/Home/Features";
import PropertyListings from "./components/Property/PropertyListings";
import Hero from "./components/Home/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <PropertyListings />
      <Features/>
       <Footer />
    </div>
  );
}
