import { NavLink, useLocation } from "react-router-dom";
import { Home, Compass, Bookmark, User, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Bosh" },
  { path: "/discover", icon: Compass, label: "Kashf et" },
];

const rightNavItems = [
  { path: "/saved", icon: Bookmark, label: "Saqlangan" },
  { path: "/profile", icon: User, label: "Profil" },
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-lg mx-auto relative">
        {/* FAB - AI Scanner */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-7 z-10">
          <button className="fab-button w-16 h-16 group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary animate-pulse-soft opacity-50 blur-md" />
            <div className="relative flex flex-col items-center justify-center gap-0.5">
              <ScanLine className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
              <span className="text-[9px] font-bold text-primary-foreground uppercase tracking-wider">AI</span>
            </div>
          </button>
        </div>

        {/* Navigation Bar */}
        <div className="glass-effect border-t border-border/50 rounded-t-3xl">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left Nav Items */}
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "nav-item",
                      isActive ? "nav-item-active" : "nav-item-inactive"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-all",
                        isActive && "drop-shadow-[0_0_8px_hsl(72_100%_50%/0.5)]"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className="text-[10px] font-medium">
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>

            {/* Center spacer for FAB */}
            <div className="w-20" />

            {/* Right Nav Items */}
            <div className="flex items-center gap-2">
              {rightNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "nav-item",
                      isActive ? "nav-item-active" : "nav-item-inactive"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-all",
                        isActive && "drop-shadow-[0_0_8px_hsl(72_100%_50%/0.5)]"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className="text-[10px] font-medium">
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
          {/* Safe area padding for iOS */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    </nav>
  );
};
