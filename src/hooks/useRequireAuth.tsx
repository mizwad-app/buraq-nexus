import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface UseRequireAuthReturn {
  requireAuth: (action: () => void, reason?: string) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authTriggerReason: string | undefined;
}

export const useRequireAuth = (): UseRequireAuthReturn => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTriggerReason, setAuthTriggerReason] = useState<string | undefined>();
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireAuth = useCallback(
    (action: () => void, reason?: string) => {
      if (user) {
        // User is authenticated, execute action immediately
        action();
      } else {
        // User not authenticated, show login modal
        setAuthTriggerReason(reason);
        setPendingAction(() => action);
        setShowAuthModal(true);
      }
    },
    [user]
  );

  return {
    requireAuth,
    showAuthModal,
    setShowAuthModal,
    authTriggerReason,
  };
};
