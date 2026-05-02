import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  CheckSquare, 
  Square, 
  Plus, 
  X, 
  Trash2,
  Briefcase,
  Book,
  Plane,
  Shield,
  ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  item_name: string;
  is_checked: boolean;
  is_default: boolean;
  sort_order: number;
}

// Default checklist items - Updated to exactly 10 essential items
const DEFAULT_ITEMS = [
  { name: "passport", icon: Book },
  { name: "cantonFairBadge", icon: Shield },
  { name: "visaCard", icon: Briefcase },
  { name: "powerBank", icon: Briefcase },
  { name: "toothbrush", icon: Briefcase },
  { name: "perfume", icon: Briefcase },
  { name: "hairbrush", icon: Briefcase },
  { name: "neckPillow", icon: Briefcase },
  { name: "simCard", icon: Shield },
  { name: "pen", icon: Book },
];

const TravelChecklist = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [loading, setLoading] = useState(true);
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  
  // Enable swipe back gesture
  useSwipeBack();

  useEffect(() => {
    if (user) {
      fetchChecklist();
    } else {
      // Use localStorage for non-authenticated users
      setUseLocalStorage(true);
      loadFromLocalStorage();
    }
  }, [user]);

  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem("travel_checklist");
    if (stored) {
      setItems(JSON.parse(stored));
    } else {
      // Initialize with default items
      const defaultItems: ChecklistItem[] = DEFAULT_ITEMS.map((item, idx) => ({
        id: `local_${idx}`,
        item_name: item.name,
        is_checked: false,
        is_default: true,
        sort_order: idx,
      }));
      setItems(defaultItems);
      localStorage.setItem("travel_checklist", JSON.stringify(defaultItems));
    }
    setLoading(false);
  };

  const saveToLocalStorage = (newItems: ChecklistItem[]) => {
    localStorage.setItem("travel_checklist", JSON.stringify(newItems));
  };

  const fetchChecklist = async () => {
    try {
      const { data, error } = await supabase
        .from("travel_checklist_items")
        .select("*")
        .eq("user_id", user?.id)
        .order("sort_order");

      if (error) throw error;

      if (data && data.length > 0) {
        // Filter out legacy default items not in current 10-item TZ, and dedupe by item_name
        const allowedDefaults = new Set(DEFAULT_ITEMS.map(i => i.name));
        const seen = new Set<string>();
        const cleaned = data.filter((it: ChecklistItem) => {
          if (it.is_default && !allowedDefaults.has(it.item_name)) return false;
          if (seen.has(it.item_name)) return false;
          seen.add(it.item_name);
          return true;
        });
        setItems(cleaned);
      } else {
        // Initialize with default items for new users
        await initializeDefaultItems();
      }
    } catch (error) {
      console.error("Error fetching checklist:", error);
      toast.error(t("checklist.errorLoading"));
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultItems = async () => {
    const defaultItems = DEFAULT_ITEMS.map((item, idx) => ({
      user_id: user?.id,
      item_name: item.name,
      is_checked: false,
      is_default: true,
      sort_order: idx,
    }));

    try {
      const { data, error } = await supabase
        .from("travel_checklist_items")
        .insert(defaultItems)
        .select();

      if (error) throw error;
      if (data) setItems(data);
    } catch (error) {
      console.error("Error initializing checklist:", error);
    }
  };

  const toggleItem = async (item: ChecklistItem) => {
    const newChecked = !item.is_checked;
    
    if (useLocalStorage) {
      const newItems = items.map(i => 
        i.id === item.id ? { ...i, is_checked: newChecked } : i
      );
      setItems(newItems);
      saveToLocalStorage(newItems);
      return;
    }

    try {
      const { error } = await supabase
        .from("travel_checklist_items")
        .update({ is_checked: newChecked })
        .eq("id", item.id);

      if (error) throw error;
      
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, is_checked: newChecked } : i
      ));
    } catch (error) {
      console.error("Error toggling item:", error);
      toast.error(t("checklist.errorUpdating"));
    }
  };

  const addItem = async () => {
    if (!newItemName.trim()) return;

    const newItem: ChecklistItem = {
      id: useLocalStorage ? `local_${Date.now()}` : "",
      item_name: newItemName.trim(),
      is_checked: false,
      is_default: false,
      sort_order: items.length,
    };

    if (useLocalStorage) {
      const newItems = [...items, newItem];
      setItems(newItems);
      saveToLocalStorage(newItems);
      setNewItemName("");
      toast.success(t("checklist.itemAdded"));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("travel_checklist_items")
        .insert({
          user_id: user?.id,
          item_name: newItem.item_name,
          is_checked: false,
          is_default: false,
          sort_order: items.length,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setItems(prev => [...prev, data]);
        setNewItemName("");
        toast.success(t("checklist.itemAdded"));
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error(t("checklist.errorAdding"));
    }
  };

  const deleteItem = async (item: ChecklistItem) => {
    if (useLocalStorage) {
      const newItems = items.filter(i => i.id !== item.id);
      setItems(newItems);
      saveToLocalStorage(newItems);
      toast.success(t("checklist.itemDeleted"));
      return;
    }

    try {
      const { error } = await supabase
        .from("travel_checklist_items")
        .delete()
        .eq("id", item.id);

      if (error) throw error;
      
      setItems(prev => prev.filter(i => i.id !== item.id));
      toast.success(t("checklist.itemDeleted"));
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(t("checklist.errorDeleting"));
    }
  };

  const checkedCount = items.filter(i => i.is_checked).length;
  const progress = items.length > 0 ? (checkedCount / items.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-all duration-200 active:scale-95"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {t("checklist.subtitle")}
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mt-1">
              {t("checklist.title")}
            </h1>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {t("checklist.progress", { checked: checkedCount, total: items.length })}
            </span>
            <span className="text-sm text-muted-foreground">
              {checkedCount} / {items.length}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && (
            <div className="flex items-center gap-2 mt-2 text-emerald-500">
              <Plane className="w-4 h-4" />
              <span className="text-sm font-medium">{t("checklist.ready")}</span>
            </div>
          )}
        </div>
      </header>

      {/* Add New Item */}
      <section className="px-5 mb-4">
        <div className="flex gap-2">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={t("checklist.addItemPlaceholder")}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <Button onClick={addItem} size="icon" className="shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Checklist Items */}
      <section className="px-5">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border transition-all",
                  item.is_checked 
                    ? "bg-muted/50 border-border/30" 
                    : "bg-card border-border/50 hover:border-primary/30"
                )}
              >
                <button
                  onClick={() => toggleItem(item)}
                  className="shrink-0"
                >
                  {item.is_checked ? (
                    <CheckSquare className="w-6 h-6 text-primary" />
                  ) : (
                    <Square className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>
                <span className={cn(
                  "flex-1 text-sm transition-all",
                  item.is_checked 
                    ? "text-muted-foreground line-through" 
                    : "text-foreground"
                )}>
                  {item.is_default 
                    ? t(`checklist.items.${item.item_name}`, item.item_name)
                    : item.item_name
                  }
                </span>
                {!item.is_default && (
                  <button
                    onClick={() => deleteItem(item)}
                    className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TravelChecklist;
