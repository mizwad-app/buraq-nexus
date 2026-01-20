import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Shield,
  MapPin,
  Store,
  Utensils,
  Building2,
  Loader2,
  ChevronDown,
  Save,
  Search,
  ArrowLeft,
  Check,
  X,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminLocationPicker } from "@/components/AdminLocationPicker";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EntityType = "markets" | "restaurants" | "translators";

interface MarketData {
  id: string;
  name: string;
  name_en: string | null;
  city: string;
  address: string | null;
  address_chinese: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string;
}

interface RestaurantData {
  id: string;
  name: string;
  name_en: string | null;
  city: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  cuisine_type: string;
}

interface TranslatorData {
  id: string;
  name: string;
  name_en: string | null;
  city: string;
  phone: string | null;
  email: string | null;
  hsk_level: number | null;
  is_verified: boolean | null;
}

const AdminLocations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  
  const [entityType, setEntityType] = useState<EntityType>("markets");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantData[]>([]);
  const [translators, setTranslators] = useState<TranslatorData[]>([]);
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Edit states
  const [editStates, setEditStates] = useState<Record<string, any>>({});

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, entityType]);

  const checkAdminRole = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user?.id)
      .eq("role", "admin")
      .maybeSingle();

    if (data) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    setLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (entityType === "markets") {
        const { data } = await supabase
          .from("wholesale_markets")
          .select("id, name, name_en, city, address, address_chinese, latitude, longitude, category")
          .order("name");
        setMarkets(data || []);
        initEditStates(data || [], ["address", "address_chinese", "latitude", "longitude"]);
      } else if (entityType === "restaurants") {
        const { data } = await supabase
          .from("restaurants")
          .select("id, name, name_en, city, address, latitude, longitude, cuisine_type")
          .order("name");
        setRestaurants(data || []);
        initEditStates(data || [], ["address", "latitude", "longitude"]);
      } else if (entityType === "translators") {
        const { data } = await supabase
          .from("translators")
          .select("id, name, name_en, city, phone, email, hsk_level, is_verified")
          .order("name");
        setTranslators(data || []);
        initEditStates(data || [], ["phone", "email", "hsk_level", "is_verified"]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const initEditStates = (data: any[], fields: string[]) => {
    const states: Record<string, any> = {};
    data.forEach((item) => {
      states[item.id] = {};
      fields.forEach((field) => {
        states[item.id][field] = item[field];
      });
    });
    setEditStates(states);
  };

  const updateEditState = (id: string, field: string, value: any) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (id: string) => {
    setSaving(id);
    try {
      const state = editStates[id];
      let error;
      
      if (entityType === "markets") {
        const result = await supabase
          .from("wholesale_markets")
          .update(state)
          .eq("id", id);
        error = result.error;
      } else if (entityType === "restaurants") {
        const result = await supabase
          .from("restaurants")
          .update(state)
          .eq("id", id);
        error = result.error;
      } else {
        const result = await supabase
          .from("translators")
          .update(state)
          .eq("id", id);
        error = result.error;
      }

      if (error) throw error;
      
      toast.success("Saved successfully!");
      fetchData();
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save");
    } finally {
      setSaving(null);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    if (selectedItem) {
      updateEditState(selectedItem.id, "latitude", lat);
      updateEditState(selectedItem.id, "longitude", lng);
      toast.success("Location updated!");
    }
  };

  const openLocationPicker = (item: any) => {
    setSelectedItem(item);
    setLocationPickerOpen(true);
  };

  const getFilteredItems = () => {
    const query = searchQuery.toLowerCase();
    if (entityType === "markets") {
      return markets.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.name_en?.toLowerCase().includes(query) ||
          m.city.toLowerCase().includes(query)
      );
    } else if (entityType === "restaurants") {
      return restaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.name_en?.toLowerCase().includes(query) ||
          r.city.toLowerCase().includes(query)
      );
    } else {
      return translators.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.name_en?.toLowerCase().includes(query) ||
          t.city.toLowerCase().includes(query)
      );
    }
  };

  if (loading && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background safe-bottom flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 mx-auto flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-sm text-muted-foreground">
            This page is for administrators only
          </p>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Location Manager
            </h1>
            <p className="text-sm text-muted-foreground">
              Edit locations and business data
            </p>
          </div>
        </div>

        {/* Entity Type Selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setEntityType("markets")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
              entityType === "markets"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <Store className="w-4 h-4" />
            <span className="text-sm font-medium">Markets</span>
          </button>
          <button
            onClick={() => setEntityType("restaurants")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
              entityType === "restaurants"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <Utensils className="w-4 h-4" />
            <span className="text-sm font-medium">Restaurants</span>
          </button>
          <button
            onClick={() => setEntityType("translators")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
              entityType === "translators"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Translators</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or city..."
            className="pl-10"
          />
        </div>
      </header>

      {/* Items List */}
      <section className="px-5 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No items found</p>
          </div>
        ) : (
          filteredItems.map((item: any) => {
            const isExpanded = expandedId === item.id;
            const editState = editStates[item.id] || {};

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-card border border-border/50 overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.city} • {item.category || item.cuisine_type || `HSK ${item.hsk_level || '?'}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(editState.latitude && editState.longitude) ? (
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                      </div>
                    ) : entityType !== "translators" && (
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-amber-500" />
                      </div>
                    )}
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                    {entityType === "markets" && (
                      <>
                        <div className="space-y-2">
                          <Label>Address</Label>
                          <Input
                            value={editState.address || ""}
                            onChange={(e) =>
                              updateEditState(item.id, "address", e.target.value)
                            }
                            placeholder="Address in local language"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Chinese Address (中文地址)</Label>
                          <Input
                            value={editState.address_chinese || ""}
                            onChange={(e) =>
                              updateEditState(item.id, "address_chinese", e.target.value)
                            }
                            placeholder="For taxi drivers"
                          />
                        </div>
                      </>
                    )}

                    {entityType === "restaurants" && (
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input
                          value={editState.address || ""}
                          onChange={(e) =>
                            updateEditState(item.id, "address", e.target.value)
                          }
                          placeholder="Restaurant address"
                        />
                      </div>
                    )}

                    {entityType === "translators" && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                              value={editState.phone || ""}
                              onChange={(e) =>
                                updateEditState(item.id, "phone", e.target.value)
                              }
                              placeholder="+86..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              value={editState.email || ""}
                              onChange={(e) =>
                                updateEditState(item.id, "email", e.target.value)
                              }
                              placeholder="email@..."
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>HSK Level</Label>
                            <Select
                              value={String(editState.hsk_level || "")}
                              onValueChange={(v) =>
                                updateEditState(item.id, "hsk_level", parseInt(v))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select HSK" />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6].map((level) => (
                                  <SelectItem key={level} value={String(level)}>
                                    HSK {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Verified</Label>
                            <button
                              onClick={() =>
                                updateEditState(
                                  item.id,
                                  "is_verified",
                                  !editState.is_verified
                                )
                              }
                              className={cn(
                                "w-full h-10 rounded-lg flex items-center justify-center gap-2 transition-all",
                                editState.is_verified
                                  ? "bg-emerald-500/20 text-emerald-500"
                                  : "bg-secondary text-muted-foreground"
                              )}
                            >
                              {editState.is_verified ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  Verified
                                </>
                              ) : (
                                <>
                                  <X className="w-4 h-4" />
                                  Not Verified
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Location Picker for markets and restaurants */}
                    {entityType !== "translators" && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Latitude</Label>
                            <Input
                              type="number"
                              step="0.000001"
                              value={editState.latitude || ""}
                              onChange={(e) =>
                                updateEditState(
                                  item.id,
                                  "latitude",
                                  parseFloat(e.target.value) || null
                                )
                              }
                              className="font-mono text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Longitude</Label>
                            <Input
                              type="number"
                              step="0.000001"
                              value={editState.longitude || ""}
                              onChange={(e) =>
                                updateEditState(
                                  item.id,
                                  "longitude",
                                  parseFloat(e.target.value) || null
                                )
                              }
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => openLocationPicker(item)}
                          className="w-full"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Open Map Picker
                        </Button>
                      </>
                    )}

                    {/* Save button */}
                    <Button
                      onClick={() => handleSave(item.id)}
                      disabled={saving === item.id}
                      className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    >
                      {saving === item.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Location Picker Modal */}
      <AdminLocationPicker
        open={locationPickerOpen}
        onOpenChange={setLocationPickerOpen}
        initialLatitude={selectedItem ? editStates[selectedItem.id]?.latitude : null}
        initialLongitude={selectedItem ? editStates[selectedItem.id]?.longitude : null}
        placeName={selectedItem?.name_en || selectedItem?.name}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
};

export default AdminLocations;
