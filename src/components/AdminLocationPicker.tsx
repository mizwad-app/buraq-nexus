import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Search, 
  Target, 
  Copy, 
  Check,
  Navigation,
  Loader2,
  Move
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AdminLocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  placeName?: string;
  onLocationSelect: (lat: number, lng: number) => void;
}

export const AdminLocationPicker = ({
  open,
  onOpenChange,
  initialLatitude,
  initialLongitude,
  placeName,
  onLocationSelect,
}: AdminLocationPickerProps) => {
  const { t } = useTranslation();
  const [latitude, setLatitude] = useState<number>(initialLatitude || 23.1291);
  const [longitude, setLongitude] = useState<number>(initialLongitude || 113.2644);
  const [searchQuery, setSearchQuery] = useState(placeName || "");
  const [searching, setSearching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Reset values when modal opens
  useEffect(() => {
    if (open) {
      setLatitude(initialLatitude || 23.1291);
      setLongitude(initialLongitude || 113.2644);
      setSearchQuery(placeName || "");
    }
  }, [open, initialLatitude, initialLongitude, placeName]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      // Use Nominatim for geocoding (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        setLatitude(parseFloat(result.lat));
        setLongitude(parseFloat(result.lon));
        toast.success(t("admin.locationFound", "Location found!"));
      } else {
        toast.error(t("admin.locationNotFound", "Location not found. Try a different search term."));
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error(t("admin.searchError", "Error searching for location"));
    } finally {
      setSearching(false);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate new coordinates based on click position
    // This is a simplified projection for demo purposes
    // In production, you'd use a proper map library
    const centerLat = latitude;
    const centerLng = longitude;
    const scale = 0.001; // Degrees per pixel (adjustable)
    
    const newLng = centerLng + (x - rect.width / 2) * scale;
    const newLat = centerLat - (y - rect.height / 2) * scale;
    
    setLatitude(newLat);
    setLongitude(newLng);
  };

  const handleCopyCoordinates = async () => {
    try {
      await navigator.clipboard.writeText(`${latitude}, ${longitude}`);
      setCopied(true);
      toast.success(t("admin.coordinatesCopied", "Coordinates copied!"));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t("admin.copyFailed", "Failed to copy"));
    }
  };

  const handleConfirm = () => {
    onLocationSelect(latitude, longitude);
    onOpenChange(false);
    toast.success(t("admin.locationSaved", "Location saved!"));
  };

  const nudgeLocation = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 0.0001; // About 11 meters
    switch (direction) {
      case 'up':
        setLatitude(prev => prev + step);
        break;
      case 'down':
        setLatitude(prev => prev - step);
        break;
      case 'left':
        setLongitude(prev => prev - step);
        break;
      case 'right':
        setLongitude(prev => prev + step);
        break;
    }
  };

  // Generate a static map image URL using OpenStreetMap
  const staticMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=17&size=400x300&maptype=osmarenderer&markers=${latitude},${longitude},red-pushpin`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {t("admin.locationPicker", "Location Picker")}
          </DialogTitle>
          <DialogDescription>
            {t("admin.locationPickerDesc", "Search for a location or adjust the pin manually for precise positioning.")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>{t("admin.searchLocation", "Search Location")}</Label>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("admin.searchPlaceholder", "Enter address or place name...")}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch} 
                disabled={searching}
                variant="outline"
                size="icon"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Map Preview */}
          <div className="space-y-2">
            <Label>{t("admin.mapPreview", "Map Preview")}</Label>
            <div 
              ref={mapRef}
              className="relative w-full h-[200px] rounded-xl overflow-hidden border border-border bg-muted"
            >
              <img
                src={staticMapUrl}
                alt="Map preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if static map fails
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              
              {/* Center pin indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <MapPin className="w-8 h-8 text-destructive drop-shadow-lg" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 bg-destructive/30 rounded-full blur-sm" />
                </div>
              </div>

              {/* Instruction overlay */}
              <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-muted-foreground text-center">
                {t("admin.useArrowsToAdjust", "Use arrow buttons below to fine-tune position")}
              </div>
            </div>
          </div>

          {/* Fine-tune controls */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Move className="w-4 h-4" />
              {t("admin.fineTune", "Fine-tune Position")}
            </Label>
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => nudgeLocation('up')}
                className="w-16"
              >
                ↑
              </Button>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => nudgeLocation('left')}
                  className="w-16"
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => nudgeLocation('right')}
                  className="w-16"
                >
                  →
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => nudgeLocation('down')}
                className="w-16"
              >
                ↓
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {t("admin.nudgeHint", "Each click moves ~11 meters")}
            </p>
          </div>

          {/* Coordinate inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("admin.latitude", "Latitude")}</Label>
              <Input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.longitude", "Longitude")}</Label>
              <Input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Copy coordinates */}
          <Button
            variant="outline"
            onClick={handleCopyCoordinates}
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-emerald-500" />
                {t("admin.copied", "Copied!")}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                {t("admin.copyCoordinates", "Copy Coordinates")}
              </>
            )}
          </Button>

          {/* Open in Maps for verification */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank')}
            >
              <Navigation className="w-3 h-3 mr-1" />
              Google
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => window.open(`https://map.baidu.com/marker?location=${longitude},${latitude}&title=Location`, '_blank')}
            >
              🐼 Baidu
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => window.open(`https://uri.amap.com/marker?position=${longitude},${latitude}&name=Location`, '_blank')}
            >
              🇨🇳 Amap
            </Button>
          </div>

          {/* Confirm button */}
          <Button
            onClick={handleConfirm}
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
          >
            <Target className="w-4 h-4 mr-2" />
            {t("admin.confirmLocation", "Confirm Location")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
