import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Redirects logged-in users to /onboarding if they haven't completed or skipped it.
 * Mounts inside the app router so it has access to navigation.
 */
export const OnboardingGate = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !user) return;
    // Don't redirect from admin or onboarding itself
    if (location.pathname === "/onboarding" || location.pathname.startsWith("/admin")) return;

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed, onboarding_skipped")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data && !data.onboarding_completed && !data.onboarding_skipped) {
        navigate("/onboarding", { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading, location.pathname, navigate]);

  return null;
};
