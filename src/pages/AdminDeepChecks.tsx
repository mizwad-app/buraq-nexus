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
  FileSearch, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Upload,
  Loader2,
  Eye,
  ChevronDown,
  AlertTriangle,
  Check,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeepCheck {
  id: string;
  user_id: string;
  product_name: string;
  manufacturer_name: string;
  product_image_url: string | null;
  status: string;
  payment_type: string;
  points_spent: number;
  amount_paid: number;
  admin_notes: string | null;
  result_summary: string | null;
  report_pdf_url: string | null;
  halal_status: string | null;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

const statusConfig = {
  pending: { label: "Kutilmoqda", icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
  in_progress: { label: "Tekshirilmoqda", icon: FileSearch, color: "text-blue-400", bg: "bg-blue-400/10" },
  completed: { label: "Yakunlandi", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  rejected: { label: "Rad etildi", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
};

const halalOptions = [
  { value: "halol", label: "Halol", icon: Check, color: "text-emerald-400" },
  { value: "haram", label: "Harom", icon: X, color: "text-red-400" },
  { value: "shubhali", label: "Shubhali", icon: AlertTriangle, color: "text-amber-400" },
];

const AdminDeepChecks = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DeepCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState<string | null>(null);

  // Form states for editing
  const [editStates, setEditStates] = useState<Record<string, {
    status: string;
    halal_status: string | null;
    result_summary: string;
    admin_notes: string;
  }>>({});

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user?.id)
      .eq("role", "admin")
      .maybeSingle();

    if (data) {
      setIsAdmin(true);
      fetchRequests();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("deep_checks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setRequests(data || []);
      
      // Initialize edit states
      const states: Record<string, any> = {};
      data?.forEach(req => {
        states[req.id] = {
          status: req.status,
          halal_status: req.halal_status,
          result_summary: req.result_summary || "",
          admin_notes: req.admin_notes || "",
        };
      });
      setEditStates(states);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (requestId: string, file: File) => {
    setUploadingPdf(requestId);
    try {
      const fileName = `reports/${requestId}_${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from("deep-checks")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Use signed URL (bucket is now private for security)
      const { data: signedUrlData } = await supabase.storage
        .from("deep-checks")
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry

      await supabase
        .from("deep_checks")
        .update({ report_pdf_url: signedUrlData?.signedUrl || null })
        .eq("id", requestId);

      toast.success("PDF yuklandi!");
      fetchRequests();
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("PDF yuklashda xatolik");
    } finally {
      setUploadingPdf(null);
    }
  };

  const handleUpdate = async (requestId: string) => {
    const state = editStates[requestId];
    if (!state) return;

    setUpdating(requestId);
    try {
      const updateData: any = {
        status: state.status,
        halal_status: state.halal_status,
        result_summary: state.result_summary || null,
        admin_notes: state.admin_notes || null,
      };

      if (state.status === "completed") {
        updateData.reviewed_at = new Date().toISOString();
        updateData.reviewed_by = user?.id;
      }

      const { error } = await supabase
        .from("deep_checks")
        .update(updateData)
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

  if (loading) {
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
            Ruxsat berilmagan
          </h1>
          <p className="text-sm text-muted-foreground">
            Bu sahifa faqat adminlar uchun
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Admin Panel
            </h1>
            <p className="text-sm text-muted-foreground">
              Chuqur tekshiruv so'rovlari
            </p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="px-5 mb-6">
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = requests.filter(r => r.status === key).length;
            const Icon = config.icon;
            return (
              <div key={key} className={cn("p-3 rounded-xl text-center", config.bg)}>
                <Icon className={cn("w-5 h-5 mx-auto mb-1", config.color)} />
                <p className="text-lg font-bold text-foreground">{count}</p>
                <p className="text-[10px] text-muted-foreground">{config.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Requests List */}
      <section className="px-5 pb-8 space-y-3">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <FileSearch className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">Hali so'rovlar yo'q</p>
          </div>
        ) : (
          requests.map((request) => {
            const status = statusConfig[request.status as keyof typeof statusConfig];
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
                    <p className="font-semibold text-foreground">{request.product_name}</p>
                    <p className="text-sm text-muted-foreground">{request.manufacturer_name}</p>
                  </div>
                  
                  {request.product_image_url && (
                    <img 
                      src={request.product_image_url} 
                      alt="Product" 
                      className="w-14 h-14 rounded-lg object-cover ml-3"
                    />
                  )}
                  
                  <ChevronDown className={cn(
                    "w-5 h-5 text-muted-foreground ml-2 transition-transform",
                    isExpanded && "rotate-180"
                  )} />
                </button>

                {/* Expanded Content */}
                {isExpanded && editState && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                    {/* Payment Info */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">To'lov:</span>
                      {request.payment_type === "points" ? (
                        <span className="text-amber-400 font-medium">{request.points_spent} ball</span>
                      ) : (
                        <span className="text-emerald-400 font-medium">${request.amount_paid}</span>
                      )}
                    </div>

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

                    {/* Halal Status */}
                    <div className="space-y-2">
                      <Label className="text-sm">Halol holati</Label>
                      <div className="flex gap-2">
                        {halalOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value}
                              onClick={() => updateEditState(request.id, "halal_status", option.value)}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-all",
                                editState.halal_status === option.value
                                  ? `bg-${option.value === "halol" ? "emerald" : option.value === "haram" ? "red" : "amber"}-500/20 border-2 border-current ${option.color}`
                                  : "bg-secondary text-muted-foreground"
                              )}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Result Summary */}
                    <div className="space-y-2">
                      <Label className="text-sm">Natija (foydalanuvchi ko'radi)</Label>
                      <Textarea
                        value={editState.result_summary}
                        onChange={(e) => updateEditState(request.id, "result_summary", e.target.value)}
                        placeholder="Tekshiruv natijasini yozing..."
                        className="bg-secondary/50 border-border/50 min-h-[80px]"
                      />
                    </div>

                    {/* Admin Notes */}
                    <div className="space-y-2">
                      <Label className="text-sm">Admin eslatmalari (faqat adminlar ko'radi)</Label>
                      <Textarea
                        value={editState.admin_notes}
                        onChange={(e) => updateEditState(request.id, "admin_notes", e.target.value)}
                        placeholder="Ichki eslatmalar..."
                        className="bg-secondary/50 border-border/50 min-h-[60px]"
                      />
                    </div>

                    {/* PDF Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm">PDF Hisobot</Label>
                      {request.report_pdf_url ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={request.report_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            PDF ko'rish
                          </a>
                          <label className="cursor-pointer">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-muted-foreground text-sm hover:bg-secondary/80 transition-colors">
                              <Upload className="w-4 h-4" />
                              Almshtirish
                            </div>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePdfUpload(request.id, file);
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <div className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/30 transition-colors">
                            {uploadingPdf === request.id ? (
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            ) : (
                              <>
                                <Upload className="w-5 h-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">PDF yuklash</span>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePdfUpload(request.id, file);
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Save Button */}
                    <Button
                      onClick={() => handleUpdate(request.id)}
                      disabled={updating === request.id}
                      className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    >
                      {updating === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Saqlash"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};

export default AdminDeepChecks;
