import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const HeaderAvatar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const initial =
    (user?.user_metadata?.full_name as string | undefined)?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    null;

  return (
    <button
      onClick={() => navigate("/profile")}
      aria-label="Profile"
      className="w-10 h-10 rounded-full bg-secondary/60 hover:bg-secondary flex items-center justify-center border border-border/60 transition-all active:scale-95"
    >
      {initial ? (
        <span className="text-sm font-semibold text-foreground">{initial}</span>
      ) : (
        <User className="w-5 h-5 text-foreground" />
      )}
    </button>
  );
};
