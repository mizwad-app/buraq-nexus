import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ConsulateInfo } from "@/components/consulate/ConsulateInfo";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Globe } from "lucide-react";

const Consulate = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [countryName, setCountryName] = useState<string | null>(null);
  const [flag, setFlag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("country_code, country_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profile?.country_code) {
        setCountryCode(profile.country_code);
        setCountryName(profile.country_name);
        const { data: country } = await supabase
          .from("countries_ref")
          .select("flag_emoji, name_uz, name_ru, name_en, name_ar, name_zh")
          .eq("code", profile.country_code)
          .maybeSingle();
        if (country) {
          setFlag(country.flag_emoji || "🏛️");
          if (!profile.country_name) {
            setCountryName(
              ((country as any)[`name_${i18n.language}`] as string) ||
                country.name_en ||
                country.name_uz
            );
          }
        }
      }
      setLoading(false);
    })();
  }, [user, i18n.language]);

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/30 px-4 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <span className="text-xl">{flag || "🏛️"}</span>
            {t("consulate.page_title")}
          </h1>
          {countryName && (
            <p className="text-xs text-muted-foreground truncate">{countryName}</p>
          )}
        </div>
      </header>

      <main className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !user ? (
          <div className="text-center py-12 space-y-3">
            <Globe className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">{t("profile.loginPrompt")}</p>
            <Button onClick={() => navigate("/profile")}>{t("profile.login")}</Button>
          </div>
        ) : !countryCode ? (
          <div className="text-center py-12 space-y-3">
            <Globe className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-foreground font-medium">{t("profile.country_not_set")}</p>
            <Button onClick={() => navigate("/onboarding")} size="sm">
              {t("profile.set_country")}
            </Button>
          </div>
        ) : (
          <ConsulateInfo countryCode={countryCode} />
        )}
      </main>
    </div>
  );
};

export default Consulate;
