import { NavLink, useLocation } from "react-router-dom";
import { Home, Plane, Moon, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Bosh sahifa" },
  { path: "/travel", icon: Plane, label: "Sayohat" },
  { path: "/ibadah", icon: Moon, label: "Ibodat" },
  { path: "/business", icon: Briefcase, label: "Biznes" },
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-border">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "nav-item flex-1 max-w-[5rem]",
                isActive ? "nav-item-active" : "nav-item-inactive"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  isActive && "eco-gradient shadow-eco"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary-foreground" : "text-current"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={cn(
                  "text-[0.65rem] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};
