import { useState, useEffect } from "react";
import { 
  Moon, 
  Clock, 
  MapPin, 
  Navigation,
  ChevronRight,
  Phone,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

const prayerTimes = [
  { name: "Bomdod", time: "05:42", active: false },
  { name: "Peshin", time: "12:15", active: true },
  { name: "Asr", time: "15:48", active: false },
  { name: "Shom", time: "18:23", active: false },
  { name: "Xufton", time: "19:45", active: false },
];

interface Mosque {
  id: number;
  name: string;
  address: string;
  distance: string;
  rating: number;
  phone?: string;
  latitude: number;
  longitude: number;
}

const nearbyMosques: Mosque[] = [
  {
    id: 1,
    name: "Minor Masjidi",
    address: "Minor ko'chasi, Toshkent",
    distance: "0.8 km",
    rating: 4.9,
    phone: "+998 71 234 5678",
    latitude: 41.3116,
    longitude: 69.2797,
  },
  {
    id: 2,
    name: "Xo'ja Ahror Valiy Masjidi",
    address: "Registon ko'chasi, Toshkent",
    distance: "1.2 km",
    rating: 4.8,
    latitude: 41.3108,
    longitude: 69.2787,
  },
  {
    id: 3,
    name: "Oq Masjid",
    address: "Chorsu, Toshkent",
    distance: "2.1 km",
    rating: 4.7,
    phone: "+998 71 345 6789",
    latitude: 41.3276,
    longitude: 69.2326,
  },
  {
    id: 4,
    name: "Kukaldosh Madrasasi",
    address: "Chorsu bazori yonida, Toshkent",
    distance: "2.3 km",
    rating: 4.9,
    latitude: 41.3285,
    longitude: 69.2295,
  },
];

const Mosques = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const requestLocation = () => {
    setLoadingLocation(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Brauzeringiz joylashuvni qo'llab-quvvatlamaydi");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingLocation(false);
      },
      (error) => {
        setLocationError("Joylashuvni aniqlab bo'lmadi");
        setLoadingLocation(false);
        console.error("Geolocation error:", error);
      }
    );
  };

  const openMosqueInMaps = (mosque: Mosque) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${mosque.latitude},${mosque.longitude}`;
    window.open(url, '_blank');
  };

  const openDirections = (mosque: Mosque) => {
    const origin = userLocation 
      ? `${userLocation.lat},${userLocation.lng}`
      : "";
    const destination = `${mosque.latitude},${mosque.longitude}`;
    const url = userLocation
      ? `https://www.google.com/maps/dir/${origin}/${destination}`
      : `https://www.google.com/maps/search/?api=1&query=${destination}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Masjidlar
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Namoz vaqtlari va masjidlar
          </h1>
          <p className="text-muted-foreground mt-1">
            Eng yaqin masjidlarni toping
          </p>
        </div>
      </header>

      {/* Prayer Times Card */}
      <section className="px-5 mb-6">
        <div className="bg-card rounded-3xl p-5 shadow-card animate-scale-in border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-foreground">
                  Namoz vaqtlari
                </h2>
                <p className="text-xs text-muted-foreground">
                  Toshkent, O'zbekiston
                </p>
              </div>
            </div>
            <button className="text-primary text-sm font-medium">
              O'zgartirish
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {prayerTimes.map((prayer, index) => (
              <div
                key={prayer.name}
                className={cn(
                  "text-center p-3 rounded-xl transition-all animate-fade-in",
                  prayer.active
                    ? "bg-gradient-to-br from-primary to-accent shadow-lg"
                    : "bg-muted"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <p
                  className={cn(
                    "text-[10px] font-medium",
                    prayer.active
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  )}
                >
                  {prayer.name}
                </p>
                <p
                  className={cn(
                    "text-sm font-bold mt-1",
                    prayer.active ? "text-primary-foreground" : "text-foreground"
                  )}
                >
                  {prayer.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Button */}
      <section className="px-5 mb-4">
        <button
          onClick={requestLocation}
          disabled={loadingLocation}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary/10 text-primary font-medium transition-all hover:bg-primary/20 disabled:opacity-50"
        >
          <Navigation className={cn("w-5 h-5", loadingLocation && "animate-pulse")} />
          {loadingLocation 
            ? "Joylashuv aniqlanmoqda..." 
            : userLocation 
              ? "Joylashuv yangilash" 
              : "Joylashuvni aniqlash"
          }
        </button>
        {locationError && (
          <p className="text-xs text-destructive text-center mt-2">{locationError}</p>
        )}
        {userLocation && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Joylashuvingiz aniqlandi ✓
          </p>
        )}
      </section>

      {/* Nearby Mosques */}
      <section className="px-5 pb-32">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-foreground">
            Yaqin atrofdagi masjidlar
          </h2>
          <button 
            onClick={() => {
              const url = userLocation 
                ? `https://www.google.com/maps/search/mosques/@${userLocation.lat},${userLocation.lng},14z`
                : `https://www.google.com/maps/search/mosques`;
              window.open(url, '_blank');
            }}
            className="text-xs text-primary font-medium flex items-center gap-1"
          >
            <MapPin className="w-3 h-3" />
            Xaritada ko'rish
          </button>
        </div>

        <div className="space-y-3">
          {nearbyMosques.map((mosque, index) => (
            <div
              key={mosque.id}
              className="bg-card rounded-2xl p-4 border border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{mosque.name}</h3>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs font-medium">{mosque.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{mosque.address}</p>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-lg">
                  {mosque.distance}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openDirections(mosque)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                >
                  <Navigation className="w-4 h-4" />
                  Yo'nalish
                </button>
                {mosque.phone && (
                  <a
                    href={`tel:${mosque.phone}`}
                    className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-muted-foreground" />
                  </a>
                )}
                <button
                  onClick={() => openMosqueInMaps(mosque)}
                  className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Mosques;
