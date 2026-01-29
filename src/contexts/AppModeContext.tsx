import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AppMode = "business" | "travel";

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

const MODE_STORAGE_KEY = "buraq_app_mode";

export const AppModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<AppMode>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    return (stored === "travel" || stored === "business") ? stored : "business";
  });

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem(MODE_STORAGE_KEY, newMode);
  };

  // Sync with localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    if (stored === "travel" || stored === "business") {
      setModeState(stored);
    }
  }, []);

  return (
    <AppModeContext.Provider value={{ mode, setMode }}>
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error("useAppMode must be used within AppModeProvider");
  }
  return context;
};
