import type { AuthState, AuthTokens } from "@/types/auth";
import type { UserDetail } from "@/types/user";
import { create } from "zustand";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (user: UserDetail, tokens: AuthTokens) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user, tokens, isAuthenticated: true });
  },

  setTokens: (tokens: AuthTokens) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
    }
    set({ tokens });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    set({ user: null, tokens: null, isAuthenticated: false });
  },

  hydrate: () => {
    if (typeof window === "undefined") {
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const userStr = localStorage.getItem("user");

    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr) as UserDetail;
        set({
          user,
          tokens: { accessToken, refreshToken },
          isAuthenticated: true,
          isHydrated: true,
        });
      } catch {
        set({ isHydrated: true });
      }
    } else {
      set({ isHydrated: true });
    }
  },
}));
