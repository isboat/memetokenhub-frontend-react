import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { exchangePrivyToken } from "../services/userService";
import type { AuthenticationStatus, PlatformUser } from "./authTypes";
import { AuthContext, type AuthContextValue } from "./authContext";
import { clearPlatformJwt, setPlatformJwt } from "./platformTokenStore";

const privyAppId = import.meta.env.VITE_PRIVY_APP_ID?.trim();

const unavailableAuthValue: AuthContextValue = {
  status: "not-configured",
  user: null,
  errorMessage: "Add VITE_PRIVY_APP_ID to connect authentication.",
  login: () => undefined,
  logout: async () => undefined,
  retryExchange: () => undefined,
};

function ConnectedAuthProvider({ children }: PropsWithChildren) {
  const {
    ready,
    authenticated,
    user: privyUser,
    login,
    logout,
    getAccessToken,
  } = usePrivy();
  const [platformUser, setPlatformUser] = useState<PlatformUser | null>(null);
  const [status, setStatus] = useState<AuthenticationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exchangeAttempt, setExchangeAttempt] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (!authenticated || !privyUser) {
      clearPlatformJwt();
      setPlatformUser(null);
      setStatus("anonymous");
      setErrorMessage(null);
      return;
    }

    const controller = new AbortController();
    async function completeTokenExchange() {
      setStatus("exchanging");
      setErrorMessage(null);
      try {
        const privyToken = await getAccessToken();
        if (!privyToken)
          throw new Error("Privy did not return an access token.");
        const exchangeResponse = await exchangePrivyToken(
          privyToken,
          controller.signal,
        );
        setPlatformJwt(exchangeResponse.jwtToken);
        setPlatformUser(exchangeResponse.user);
        setStatus("authenticated");
      } catch (error) {
        if (controller.signal.aborted) return;
        clearPlatformJwt();
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Authentication failed.",
        );
      }
    }

    void completeTokenExchange();
    return () => controller.abort();
  }, [authenticated, exchangeAttempt, getAccessToken, privyUser, ready]);

  const handleLogout = useCallback(async () => {
    clearPlatformJwt();
    setPlatformUser(null);
    await logout();
  }, [logout]);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      status,
      user: platformUser,
      errorMessage,
      login,
      logout: handleLogout,
      retryExchange: () => setExchangeAttempt((attempt) => attempt + 1),
    }),
    [errorMessage, handleLogout, login, platformUser, status],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function AuthProvider({ children }: PropsWithChildren) {
  if (!privyAppId) {
    return (
      <AuthContext.Provider value={unavailableAuthValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ["email", "wallet"],
        appearance: { theme: "dark", accentColor: "#5271ff" },
      }}
    >
      <ConnectedAuthProvider>{children}</ConnectedAuthProvider>
    </PrivyProvider>
  );
}
