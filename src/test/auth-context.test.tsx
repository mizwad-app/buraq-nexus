import { describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { authContext } from "@/contexts/auth-context";
import { useContext } from "react";

describe("auth context identity", () => {
  it("preserves the context when a module is evaluated again", async () => {
    vi.resetModules();
    const reloaded = await import("@/contexts/auth-context");
    expect(reloaded.authContext).toBe(authContext);
  });

  it("shares the provider state with consumers after module reevaluation", async () => {
    vi.resetModules();
    const reloaded = await import("@/contexts/auth-context");
    function Consumer() {
      const state = useContext(reloaded.authContext);
      return <span>{state?.loading === false && state.user === null ? "guest" : "missing"}</span>;
    }
    render(
      <authContext.Provider value={{ user: null, session: null, loading: false, signOut: async () => {} }}>
        <Consumer />
      </authContext.Provider>,
    );
    expect(screen.getByText("guest")).toBeInTheDocument();
    cleanup();
  });
});