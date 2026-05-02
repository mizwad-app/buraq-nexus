import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileSearch,
  Download,
  ChevronRight,
  Check,
  X,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeepCheck {
  id: string;
  product_name: string;
  manufacturer_name: string;
  status: string;
  halal_status: string | null;
  result_summary: string | null;
  report_pdf_url: string | null;
  created_at: string;
}

const statusConfig = {
  pending: { label: "Kutilmoqda", icon: Clock, color: "text-gold", bg: "bg-gold/10" },
  in_progress: { label: "Tekshirilmoqda", icon: FileSearch, color: "text-blue-400", bg: "bg-blue-400/10" },
  completed: { label: "Yakunlandi", icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
  rejected: { label: "Rad etildi", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
};

const halalConfig = {
  halol: { label: "Halol", icon: Check, color: "text-primary", bg: "bg-primary/20" },
  haram: { label: "Harom", icon: X, color: "text-red-400", bg: "bg-red-500/20" },
  shubhali: { label: "Shubhali", icon: AlertTriangle, color: "text-gold", bg: "bg-gold/20" },
};

interface MyReportsProps {
  onEmpty?: () => void;
}

export const MyReports = ({ onEmpty }: MyReportsProps) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<DeepCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("deep_checks")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
      
      if (data?.length === 0 && onEmpty) {
        onEmpty();
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Hali hisobotlar yo'q
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => {
        const status = statusConfig[report.status as keyof typeof statusConfig];
        const StatusIcon = status?.icon || Clock;
        const isExpanded = expandedId === report.id;
        const halal = report.halal_status ? halalConfig[report.halal_status as keyof typeof halalConfig] : null;

        return (
          <div
            key={report.id}
            className="rounded-xl bg-card border border-border/50 overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : report.id)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{report.product_name}</p>
                <p className="text-xs text-muted-foreground">{report.manufacturer_name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={cn("px-2 py-0.5 rounded-full flex items-center gap-1", status?.bg)}>
                    <StatusIcon className={cn("w-3 h-3", status?.color)} />
                    <span className={cn("text-[10px] font-medium", status?.color)}>
                      {status?.label}
                    </span>
                  </div>
                  {halal && (
                    <div className={cn("px-2 py-0.5 rounded-full flex items-center gap-1", halal.bg)}>
                      <halal.icon className={cn("w-3 h-3", halal.color)} />
                      <span className={cn("text-[10px] font-medium", halal.color)}>
                        {halal.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight className={cn(
                "w-5 h-5 text-muted-foreground transition-transform",
                isExpanded && "rotate-90"
              )} />
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
                {report.result_summary && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Natija:</p>
                    <p className="text-sm text-foreground">{report.result_summary}</p>
                  </div>
                )}
                
                {report.report_pdf_url && (
                  <a
                    href={report.report_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    PDF Hisobotni yuklab olish
                  </a>
                )}
                
                <p className="text-[10px] text-muted-foreground">
                  Yuborilgan: {new Date(report.created_at).toLocaleDateString("uz-UZ")}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
