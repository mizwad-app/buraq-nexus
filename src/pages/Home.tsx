import { useNavigate } from "react-router-dom";
import { ImageCard } from "@/components/ImageCard";

import halalFood from "@/assets/halol-food.jpg";
import travelNature from "@/assets/travel-nature.jpg";
import business from "@/assets/business.jpg";
import cargo from "@/assets/cargo.jpg";
import mosque from "@/assets/mosque.jpg";
import ecoProjects from "@/assets/eco-projects.jpg";

const modules = [
  {
    id: "halol",
    title: "Halol Taomlar",
    image: halalFood,
    route: "/ibadah",
  },
  {
    id: "travel",
    title: "Sayohat va Bog'lar",
    image: travelNature,
    route: "/travel",
  },
  {
    id: "business",
    title: "Biznes Tekshiruv",
    image: business,
    route: "/business",
  },
  {
    id: "cargo",
    title: "Yuk Kuzatuvi",
    image: cargo,
    route: "/cargo",
  },
  {
    id: "mosque",
    title: "Masjidlar",
    image: mosque,
    route: "/mosques",
  },
  {
    id: "eco",
    title: "Eco Projects",
    image: ecoProjects,
    route: "/eco",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Buraq Ekotizimi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Premium xizmatlar platformasi
          </p>
        </div>
      </header>

      {/* Module Grid */}
      <section className="px-5 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {modules.map((module, index) => (
            <ImageCard
              key={module.id}
              image={module.image}
              title={module.title}
              onClick={() => navigate(module.route)}
              delay={index * 80}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
