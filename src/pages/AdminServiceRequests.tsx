import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  MessageCircle,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ServiceRequest {
  id: string;
  user_id: string;
  service_type: string;
  title: string;
  description: string | null;
  contact_method: string | null;
  status: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  pending: { label: "Kutilmoqda", icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
  in_progress: { label: "Jarayonda", icon: Briefcase, color: "text-blue-400", bg: "bg-blue-400/10" },
  completed: { label: "Bajarildi", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  cancelled: { label: "Bekor qilindi", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
};

const serviceTypeLabels: Record<string, string> = {
  cargo_inspection: "Yuk tekshiruvi",
  flight_booking: "Aviabilet buyurtma",
  train_booking: "Poyezd bileti",
  vpn_setup: "VPN o'rnatish",
  concierge: "Konsyerj xizmati",
};

const AdminServiceRequests = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editStates, setEditStates] = useState<Record<string, { status: string; admin_notes: string }>>({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setRequests(data || []);
      
      // Initialize edit states
      const states: Record<string, any> = {};
      data?.forEach(req => {
        states[req.id] = {
          status: req.status || "pending",
          admin_notes: req.admin_notes || "",
        };
      });
      setEditStates(states);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("So'rovlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (requestId: string) => {
    const state = editStates[requestId];
    if (!state) return;

    setUpdating(requestId);
    try {
      const { error } = await supabase
        .from("service_requests")
        .update({
          status: state.status,
          admin_notes: state.admin_notes,
        })
        .eq("id", requestId);

      if (error) throw error;

      toast.success("Yangilandi!");
      fetchRequests();
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Yangilashda xatolik");
    } finally {
      setUpdating(null);
    }
  };

  const updateEditState = (requestId: string, field: string, value: any) => {
    setEditStates(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [field]: value,
      }
    }));
  };

  const filteredRequests = requests.filter(req =>
    req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.service_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Xizmat so'rovlari
        </h1>
        <p className="text-muted-foreground mt-1">
          Foydalanuvchilardan kelgan so'rovlarni boshqarish
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = requests.filter(r => (r.status || "pending") === key).length;
          const Icon = config.icon;
          return (
            <div key={key} className={cn("p-4 rounded-xl text-center", config.bg)}>
              <Icon className={cn("w-6 h-6 mx-auto mb-2", config.color)} />
              <p className="text-2xl font-bold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground">{config.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Qidirish..."
          className="pl-10"
        />
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">Hali so'rovlar yo'q</p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const status = statusConfig[(request.status || "pending") as keyof typeof statusConfig];
            const StatusIcon = status?.icon || Clock;
            const isExpanded = expandedId === request.id;
            const editState = editStates[request.id];

            return (
              <div
                key={request.id}
                className="rounded-2xl bg-card border border-border/50 overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : request.id)}
                  className="w-full p-4 flex items-start justify-between text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn("px-2 py-1 rounded-full flex items-center gap-1", status?.bg)}>
                        <StatusIcon className={cn("w-3.5 h-3.5", status?.color)} />
                        <span className={cn("text-xs font-medium", status?.color)}>
                          {status?.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString("uz-UZ")}
                      </span>
                    </div>
                    <p className="font-semibold text-foreground">{request.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {serviceTypeLabels[request.service_type] || request.service_type}
                    </p>
                  </div>
                  
                  {request.contact_method && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary">
                      <MessageCircle className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground capitalize">
                        {request.contact_method}
                      </span>
                    </div>
                  )}
                  
                  <ChevronDown className={cn(
                    "w-5 h-5 text-muted-foreground ml-2 transition-transform",
                    isExpanded && "rotate-180"
                  )} />
                </button>

                {/* Expanded Content */}
                {isExpanded && editState && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                    {/* Description */}
                    {request.description && (
                      <div>
                        <Label className="text-sm">Tavsif</Label>
                        <p className="text-sm text-foreground mt-1 p-3 rounded-lg bg-secondary/50">
                          {request.description}
                        </p>
                      </div>
                    )}

                    {/* Status Select */}
                    <div className="space-y-2">
                      <Label className="text-sm">Status</Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <button
                            key={key}
                            onClick={() => updateEditState(request.id, "status", key)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                              editState.status === key
                                ? `${config.bg} ${config.color} border-2 border-current`
                                : "bg-secondary text-muted-foreground"
                            )}
                          >
                            {config.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="space-y-2">
                      <Label className="text-sm">Admin eslatmalari</Label>
                      <Textarea
                        value={editState.admin_notes}
                        onChange={(e) => updateEditState(request.id, "admin_notes", e.target.value)}
                        placeholder="Ichki eslatmalar..."
                        className="bg-secondary/50 border-border/50 min-h-[60px]"
                      />
                    </div>

                    {/* Save Button */}
                    <Button
                      onClick={() => handleUpdate(request.id)}
                      disabled={updating === request.id}
                      className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    >
                      {updating === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Saqlash
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminServiceRequests;
