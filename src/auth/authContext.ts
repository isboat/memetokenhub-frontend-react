import { createContext, useContext } from "react";
import type { AuthenticationStatus, PlatformUser } from "./authTypes";

export interface AuthContextValue {
  status: AuthenticationStatus;
  user: PlatformUser | null;
  errorMessage: string | null;
  login: () => void;
  logout: () => Promise<void>;
  retryExchange: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
