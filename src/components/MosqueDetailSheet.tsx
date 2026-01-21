import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Moon,
  Navigation,
  MapPin,
  Check,
  Users,
  ScrollText,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { MapNavigationSheet } from "./MapNavigationSheet";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { Card, CardContent } from "@/components/ui/card";

// Import mosque images
import huaisheng1 from "@/assets/mosques/huaisheng-1.jpg";
import huaisheng2 from "@/assets/mosques/huaisheng-2.jpg";
import huaisheng3 from "@/assets/mosques/huaisheng-3.jpg";
import abiVaqqos1 from "@/assets/mosques/abi-vaqqos-1.jpg";
import abiVaqqos2 from "@/assets/mosques/abi-vaqqos-2.jpg";
import xiaodongying1 from "@/assets/mosques/xiaodongying-1.jpg";
import xiaodongying2 from "@/assets/mosques/xiaodongying-2.jpg";
import xiaodongying3 from "@/assets/mosques/xiaodongying-3.jpg";

interface MosqueDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mosque: {
    id: string;
    name: string;
    city: string;
    country: string;
    address: string | null;
    description: string | null;
    has_friday_prayer: boolean;
    has_womens_section: boolean;
    latitude: number | null;
    longitude: number | null;
    image_url?: string | null;
    name_uz?: string | null;
    name_ru?: string | null;
    name_en?: string | null;
    name_ar?: string | null;
    description_uz?: string | null;
    description_ru?: string | null;
    description_en?: string | null;
    description_ar?: string | null;
    city_uz?: string | null;
    city_ru?: string | null;
    city_en?: string | null;
    city_ar?: string | null;
    address_uz?: string | null;
    address_ru?: string | null;
    address_en?: string | null;
    address_ar?: string | null;
    [key: string]: unknown;
  } | null;
}

const MOSQUE_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80";

// Mosque image galleries
const MOSQUE_GALLERIES: Record<string, string[]> = {
  "huaisheng": [huaisheng1, huaisheng2, huaisheng3],
  "abi_vaqqos": [abiVaqqos1, abiVaqqos2],
  "xiaodongying": [xiaodongying1, xiaodongying2, xiaodongying3],
  "haopan": [] // Placeholder - will use fallback
};

// Historical content for specific mosques
const MOSQUE_HISTORY: Record<string, {
  origin?: string;
  history?: string;
  features?: string[];
  poem?: string;
  poemTitle?: string;
}> = {
  "huaisheng": {
    origin: "\"Huai\" — sog'inish/xotirlash, \"Sheng\" — muqaddas/payg'ambar demakdir. Ya'ni, \"Payg'ambarimiz Muhammad (s.a.v)ni sog'inib qurilgan masjid\".",
    history: "Bu masjid Xitoydagi eng qadimiy bino bo'lib, milodiy 627-yilda Arabistondan kelgan ilk musulmon elchilar tomonidan qurilgan.",
    features: [
      "36 metrlik Nur minorasi qadimda kemalarga mayoq vazifasini bajargan",
      "Xitoyning eng qadimiy masjidi",
      "Sahoba Sa'd ibn Abu Vaqqos (r.a.) tomonidan ta'sis etilgan"
    ],
    poem: "Koinot yaralganda, Uning ismi samoviy kitobda yozilgan edi. Buyuk din targ'ibotchisi G'arbda (Arabistonda) dunyoga keldi. U osmon kitobini (Qur'onni) qabul qildi, o'ttiz pora bo'lib, butun insoniyatni hidoyatga boshladi. U barcha bandalarning rahnamosi, muqaddas zotlarning peshvosidir. Osmon saltanatiga ko'mak berib, xalqni o'z himoyasiga oldi. Besh vaqt namoz orqali tinchlik va omonlik so'raldi. Uning qalbi Allohda edi, fikri-zikri muhtojlarga yordam berishda. Qiyinchilikdan qutqaruvchi, zulmatdan nurga chiquvchidir. Ruhlarni poklovchi va gunohlardan xalos etuvchidir. Uning rahmati butun dunyoni qopladi, uning yo'li azaldan to abadgacha eng yuksakdir. Hamma unga taslim bo'ldi, uning dinining nomi — Islomdir. Muhammad (s.a.v) — eng oliyjanob Payg'ambardir!",
    poemTitle: "Yuz so'zli madhiya — Imperator Xongvu (1368)"
  },
  "abi_vaqqos": {
    origin: "Sahoba Sa'd ibn Abu Vaqqos (r.a.) sharafiga nomlangan. \"Xianxian\" — \"Donishmandlar va azizlar masjidi\" demakdir.",
    history: "Hududda juda qadimiy musulmonlar qabristoni va Guangzhou Islom Assotsiatsiyasi joylashgan.",
    features: [
      "Sahoba Sa'd ibn Abu Vaqqos (r.a.) qabri",
      "Guangzhou Islom Assotsiatsiyasi markazi",
      "Eng qadimiy musulmon qabristoni"
    ]
  },
  "xiaodongying": {
    history: "Ming sulolasi (1368–1644) davrida musulmon askarlar tomonidan qurilgan.",
    features: [
      "Ming sulolasi me'morchiligi",
      "Harbiy-islomiy tarix",
      "An'anaviy xitoy-islom uslubi"
    ]
  },
  "haopan": {
    history: "Guangzhoudagi tarixiy masjidlardan biri bo'lib, mahalliy musulmonlar jamiyatiga xizmat qiladi.",
    features: [
      "Mahalliy musulmonlar markazi",
      "Juma namozi o'qiladi",
      "Ayollar bo'limi mavjud"
    ]
  }
};

// Helper to detect mosque type based on name
const getMosqueHistoryKey = (mosqueName: string): string | null => {
  const lowerName = mosqueName.toLowerCase();
  if (lowerName.includes("huaisheng") || lowerName.includes("怀圣")) return "huaisheng";
  if (lowerName.includes("vaqqos") || lowerName.includes("先贤") || lowerName.includes("xianxian")) return "abi_vaqqos";
  if (lowerName.includes("xiaodongying") || lowerName.includes("小东营")) return "xiaodongying";
  if (lowerName.includes("haopan") || lowerName.includes("濠畔")) return "haopan";
  return null;
};

// Image Gallery Carousel Component
const ImageGallery = ({ images, mosqueName }: { images: string[]; mosqueName: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) {
    return (
      <div className="relative h-56 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
        <div className="text-center p-4">
          <Moon className="w-16 h-16 text-emerald-500/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Rasm tez orada qo'shiladi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-56 w-full rounded-2xl overflow-hidden">
      {/* Main Image */}
      <img
        src={images[currentIndex]}
        alt={`${mosqueName} - ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-white w-4"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export const MosqueDetailSheet = ({ open, onOpenChange, mosque }: MosqueDetailSheetProps) => {
  const { t } = useTranslation();
  const { getField } = useTranslatedField();
  const [mapSheetOpen, setMapSheetOpen] = useState(false);

  if (!mosque) return null;

  const translatedName = getField(mosque, 'name');
  const translatedDescription = getField(mosque, 'description');
  const translatedAddress = getField(mosque, 'address');
  const translatedCity = getField(mosque, 'city');

  // Get historical content if available
  const historyKey = getMosqueHistoryKey(mosque.name);
  const historyData = historyKey ? MOSQUE_HISTORY[historyKey] : null;
  const galleryImages = historyKey ? MOSQUE_GALLERIES[historyKey] || [] : [];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl px-0">
          <SheetHeader className="px-5 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <Moon className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-left text-lg leading-tight">
                  {translatedName}
                </SheetTitle>
                <p className="text-sm text-muted-foreground font-mono mt-0.5">{mosque.name}</p>
              </div>
            </div>
          </SheetHeader>

          <div className="overflow-y-auto h-full pb-20 px-5 pt-4 space-y-4">
            {/* Image Gallery Carousel */}
            <ImageGallery images={galleryImages} mosqueName={translatedName} />

            {/* Feature Badges */}
            <div className="flex flex-wrap gap-2">
              {mosque.has_friday_prayer && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium border border-emerald-500/20">
                  <Check className="w-3 h-3" />
                  {t("mosques.fridayPrayer")}
                </span>
              )}
              {mosque.has_womens_section && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  <Users className="w-3 h-3" />
                  {t("mosques.womensSection")}
                </span>
              )}
              {historyKey && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium border border-amber-500/20">
                  <Star className="w-3 h-3" />
                  Tarixiy masjid
                </span>
              )}
            </div>

            {/* Location */}
            <div className="bg-card rounded-2xl p-4 border border-border/50">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                {t("business.location")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {translatedAddress || `${translatedCity}, ${mosque.country}`}
              </p>
            </div>

            {/* Description */}
            {translatedDescription && (
              <div className="bg-card rounded-2xl p-4 border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">{t("mosque.about")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{translatedDescription}</p>
              </div>
            )}

            {/* Historical Content */}
            {historyData && (
              <>
                {/* Name Origin */}
                {historyData.origin && (
                  <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                        <ScrollText className="w-4 h-4 text-amber-500" />
                        {t("mosque.nameOrigin")}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{historyData.origin}</p>
                    </CardContent>
                  </Card>
                )}

                {/* History */}
                {historyData.history && (
                  <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-blue-500" />
                        {t("mosque.history")}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{historyData.history}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Features */}
                {historyData.features && historyData.features.length > 0 && (
                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3">{t("mosque.features")}</h3>
                      <ul className="space-y-2">
                        {historyData.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* The Hundred-word Eulogy Poem */}
                {historyData.poem && (
                  <Card className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-green-500/10 border-emerald-500/20 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHBhdGggZD0iTTAgMjBoNDBNMjAgMHY0MCIgc3Ryb2tlPSJyZ2JhKDE2LDE4NSwxMjksMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50" />
                    <CardContent className="p-5 relative">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Moon className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-lg">{historyData.poemTitle}</h3>
                          <p className="text-xs text-muted-foreground">{t("mosque.poemSubtitle")}</p>
                        </div>
                      </div>
                      <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/10">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap italic">
                          "{historyData.poem}"
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Navigate Button */}
            {mosque.latitude && mosque.longitude && (
              <button
                onClick={() => setMapSheetOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:opacity-90 transition-opacity"
              >
                <Navigation className="w-5 h-5" />
                {t("mosques.directions")}
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Map Navigation Sheet */}
      {mosque.latitude && mosque.longitude && (
        <MapNavigationSheet
          open={mapSheetOpen}
          onOpenChange={setMapSheetOpen}
          latitude={mosque.latitude}
          longitude={mosque.longitude}
          name={translatedName}
          address={translatedAddress || undefined}
        />
      )}
    </>
  );
};
