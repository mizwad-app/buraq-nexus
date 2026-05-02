import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Briefcase, Moon, Plane, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const BottomNavigation = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: "/", icon: Home, label: t("nav.home") },
    { path: "/business", icon: Briefcase, label: t("nav.business") },
    { path: "/ibadah", icon: Moon, label: t("nav.halal") },
    { path: "/travel", icon: Plane, label: t("nav.travel") },
    { path: "/profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-lg mx-auto">
        <div className="glass-effect border-t border-border/50 rounded-t-3xl">
          <div className="flex items-stretch justify-between px-2 py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={cn(
                      "transition-all",
                      isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                    )}
                  />
                  <span className="text-[11px] font-medium leading-none">
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    </nav>
  );
};
