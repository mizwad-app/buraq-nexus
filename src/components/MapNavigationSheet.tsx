import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { 
  MapPin, 
  Navigation, 
  Copy, 
  Check,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { wgs84ToGcj02, wgs84ToBd09 } from "@/lib/coordinates";
import { toast } from "sonner";

interface MapNavigationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  latitude: number;
  longitude: number;
  name: string;
  address?: string | null;
  addressChinese?: string | null;
}

interface MapProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  getUrl: (lat: number, lng: number, name: string) => string;
  description: string;
}

export const MapNavigationSheet = ({
  open,
  onOpenChange,
  latitude,
  longitude,
  name,
  address,
  addressChinese,
}: MapNavigationSheetProps) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Convert coordinates for Chinese map services
  const gcj02 = wgs84ToGcj02(latitude, longitude);
  const bd09 = wgs84ToBd09(latitude, longitude);

  const mapProviders: MapProvider[] = [
    {
      id: "google",
      name: "Google Maps",
      icon: "🌍",
      color: "bg-blue-500/10 text-blue-600",
      description: t("mapNav.googleDesc"),
      getUrl: (lat, lng, placeName) => {
        // Google Maps deep link with fallback
        const encoded = encodeURIComponent(placeName);
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encoded}`;
      },
    },
    {
      id: "yandex",
      name: "Yandex Maps",
      icon: "🗺️",
      color: "bg-red-500/10 text-red-600",
      description: t("mapNav.yandexDesc"),
      getUrl: (lat, lng, placeName) => {
        // Yandex Maps deep link - try app first, fallback to web
        const encoded = encodeURIComponent(placeName);
        return `yandexmaps://maps.yandex.ru/?pt=${lng},${lat}&z=17&l=map&text=${encoded}`;
      },
    },
    {
      id: "baidu",
      name: "Baidu Maps",
      icon: "🐼",
      color: "bg-blue-600/10 text-blue-700",
      description: t("mapNav.baiduDesc"),
      getUrl: (lat, lng, placeName) => {
        // Baidu uses BD-09 coordinates - converted for accuracy
        const encoded = encodeURIComponent(placeName);
        // Deep link format: baidumap://map/marker for app, with web fallback
        return `baidumap://map/marker?location=${bd09.lat},${bd09.lng}&title=${encoded}&content=${encoded}&src=lovable&coord_type=bd09ll`;
      },
    },
    {
      id: "apple",
      name: "Apple Maps",
      icon: "🍎",
      color: "bg-gray-500/10 text-gray-700",
      description: t("mapNav.appleDesc"),
      getUrl: (lat, lng, placeName) => {
        // Apple Maps universal link
        const encoded = encodeURIComponent(placeName);
        return `http://maps.apple.com/?ll=${lat},${lng}&q=${encoded}&z=17`;
      },
    },
    {
      id: "gaode",
      name: "Gaode / Amap",
      icon: "🇨🇳",
      color: "bg-emerald-500/10 text-emerald-600",
      description: t("mapNav.gaodeDesc"),
      getUrl: (lat, lng, placeName) => {
        // Gaode/Amap uses GCJ-02 coordinates - converted for accuracy
        const encoded = encodeURIComponent(placeName);
        // Deep link with dev=0 means coordinates are already GCJ-02
        return `androidamap://viewMap?sourceApplication=lovable&poiname=${encoded}&lat=${gcj02.lat}&lon=${gcj02.lng}&dev=0`;
      },
    },
  ];

  const handleOpenMap = (provider: MapProvider) => {
    const url = provider.getUrl(latitude, longitude, name);
    const encodedName = encodeURIComponent(name);
    
    // Define web fallback URLs with proper coordinate conversions
    const webFallbacks: Record<string, string> = {
      google: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      yandex: `https://yandex.com/maps/?pt=${longitude},${latitude}&z=17&l=map&text=${encodedName}`,
      baidu: `https://map.baidu.com/?latlng=${bd09.lat},${bd09.lng}&title=${encodedName}&content=${encodedName}&autoOpen=true`,
      apple: `https://maps.apple.com/?ll=${latitude},${longitude}&q=${encodedName}&z=17`,
      gaode: `https://uri.amap.com/marker?position=${gcj02.lng},${gcj02.lat}&name=${encodedName}&coordinate=gaode`,
    };
    
    // For HTTP URLs, open directly
    if (url.startsWith('http')) {
      window.open(url, '_blank');
      onOpenChange(false);
      return;
    }
    
    // For app-specific URL schemes, try deep link with fallback
    const link = document.createElement('a');
    link.href = url;
    
    // Create a hidden iframe to attempt deep link
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    
    // Set timeout for fallback
    const timeout = setTimeout(() => {
      document.body.removeChild(iframe);
      
      // Show toast with web fallback option
      toast.info(t("mapNav.appNotInstalled"), {
        duration: 5000,
        action: {
          label: t("mapNav.openWeb"),
          onClick: () => {
            const fallbackUrl = webFallbacks[provider.id];
            if (fallbackUrl) {
              window.open(fallbackUrl, '_blank');
            }
          }
        }
      });
    }, 1500);
    
    // If app opens, the page will blur - we can detect this
    const handleBlur = () => {
      clearTimeout(timeout);
      document.body.removeChild(iframe);
      window.removeEventListener('blur', handleBlur);
    };
    window.addEventListener('blur', handleBlur);
    
    // Also try direct navigation for mobile
    window.location.href = url;
    
    onOpenChange(false);
  };

  const handleCopyAddress = async () => {
    const textToCopy = addressChinese || address || name;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success(t("mapNav.addressCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error(t("mapNav.copyFailed"));
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-0 pb-8">
        <SheetHeader className="px-5 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Navigation className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <SheetTitle className="text-lg font-semibold truncate">
                {name}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground truncate">
                {t("mapNav.selectApp")}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="px-5 pt-4 space-y-3">
          {/* Map Providers */}
          <div className="grid grid-cols-1 gap-2">
            {mapProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleOpenMap(provider)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border border-border/50",
                  "bg-card hover:bg-muted/50 transition-all text-left"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
                  provider.color
                )}>
                  {provider.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{provider.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {provider.description}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>

          {/* Copy Address Section */}
          <div className="pt-3 border-t border-border/50">
            <button
              onClick={handleCopyAddress}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border border-border/50",
                "bg-amber-500/10 hover:bg-amber-500/20 transition-all text-left"
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Copy className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">
                  {t("mapNav.copyAddressChinese")}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {addressChinese || address || t("mapNav.forTaxi")}
                </div>
              </div>
            </button>
          </div>

          {/* Coordinates Info */}
          <div className="text-xs text-center text-muted-foreground pt-2">
            <MapPin className="w-3 h-3 inline-block mr-1" />
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
