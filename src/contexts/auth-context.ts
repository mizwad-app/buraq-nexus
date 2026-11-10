import { createContext, type Context } from "react";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Preview refreshes can evaluate a module under multiple versioned URLs.
// Keep provider and consumers attached to one context in this JavaScript realm.
const registry = globalThis as typeof globalThis & {
  __mizwadAuthContext?: Context<AuthContextType | undefined>;
};

export const authContext =
  registry.__mizwadAuthContext ?? createContext<AuthContextType | undefined>(undefined);

registry.__mizwadAuthContext = authContext;