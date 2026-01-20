import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Loader2, Shield } from "lucide-react";

const AdminLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/admin/login", { replace: true });
      } else {
        checkAdminRole();
      }
    }
  }, [user, authLoading]);

  const checkAdminRole = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user?.id)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!data);
    setChecking(false);

    if (!data) {
      navigate("/admin/login", { replace: true });
    }
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
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
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
