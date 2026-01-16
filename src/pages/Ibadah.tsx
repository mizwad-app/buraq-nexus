import { useState } from "react";
import {
  Utensils,
  MapPin,
  ScanLine,
  AlertTriangle,
  ChevronRight,
  Star,
  Shield,
  XCircle,
} from "lucide-react";
import { AIScannerModal } from "@/components/AIScannerModal";

// Ingredients to avoid
const harmfulIngredients = [
  { name: "Jelatin (cho'chqa)", category: "Haram", severity: "high" },
  { name: "E120 (Karmin)", category: "Shubhali", severity: "medium" },
  { name: "E441 (Jelatin)", category: "Shubhali", severity: "medium" },
  { name: "Alkogol", category: "Haram", severity: "high" },
  { name: "E422 (Glitserin)", category: "Shubhali", severity: "low" },
  { name: "E471 (Mono va diglitseridlar)", category: "Shubhali", severity: "medium" },
];

// Halal certified restaurants
const halalRestaurants = [
  {
    id: 1,
    name: "Afsona Restaurant",
    address: "Amir Temur ko'chasi, Toshkent",
    rating: 4.8,
    certified: true,
    distance: "0.5 km",
  },
  {
    id: 2,
    name: "Caravan",
    address: "Shota Rustaveli, Toshkent",
    rating: 4.6,
    certified: true,
    distance: "1.2 km",
  },
  {
    id: 3,
    name: "Sim-Sim",
    address: "Navoiy ko'chasi, Toshkent",
    rating: 4.7,
    certified: true,
    distance: "2.1 km",
  },
];

const Ibadah = () => {
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Halol Taomlar
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Halol ovqatlanish
          </h1>
          <p className="text-muted-foreground mt-1">
            AI skaner va sertifikatlangan restoranlar
          </p>
        </div>
      </header>

      {/* AI Scanner Card */}
      <section className="px-5 mb-6">
        <button
          onClick={() => setScannerOpen(true)}
          className="w-full text-left"
        >
          <div className="relative rounded-2xl overflow-hidden animate-scale-in">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-emerald-600/30" />
            
            {/* Content */}
            <div className="relative p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <ScanLine className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display font-semibold text-foreground text-lg">
                    AI Skaner
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Mahsulotni tekshirish uchun skanerlang
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </button>
      </section>

      {/* Halal Restaurants Section */}
      <section className="px-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-foreground">
            Halol restoranlar
          </h2>
          <button className="text-xs text-primary font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Xaritada
          </button>
        </div>

        <div className="space-y-3">
          {halalRestaurants.map((restaurant, index) => (
            <div
              key={restaurant.id}
              className="bg-card rounded-2xl p-4 border border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{restaurant.name}</h3>
                    {restaurant.certified && (
                      <Shield className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs font-medium">{restaurant.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{restaurant.distance}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ingredients to Avoid */}
      <section className="px-5 pb-32">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-display font-semibold text-foreground">
            Saqlanish kerak bo'lgan ingredientlar
          </h2>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          {harmfulIngredients.map((ingredient, index) => (
            <div
              key={ingredient.name}
              className="flex items-center justify-between p-4 border-b border-border/50 last:border-b-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  ingredient.severity === "high" 
                    ? "bg-red-500/10" 
                    : ingredient.severity === "medium"
                      ? "bg-amber-500/10"
                      : "bg-yellow-500/10"
                }`}>
                  <XCircle className={`w-4 h-4 ${
                    ingredient.severity === "high" 
                      ? "text-red-500" 
                      : ingredient.severity === "medium"
                        ? "text-amber-500"
                        : "text-yellow-500"
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{ingredient.name}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                ingredient.category === "Haram"
                  ? "bg-red-500/10 text-red-500"
                  : "bg-amber-500/10 text-amber-500"
              }`}>
                {ingredient.category}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* AI Scanner Modal */}
      <AIScannerModal open={scannerOpen} onOpenChange={setScannerOpen} />
    </div>
  );
};

export default Ibadah;
