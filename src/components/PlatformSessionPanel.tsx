import type { ReactNode } from "react";
import { useAuth } from "../auth/authContext";

interface PlatformSessionPanelProps {
  icon: ReactNode;
  heading: string;
  description: string;
}

/**
 * Keeps protected routes aligned with the two-stage Privy/platform login flow.
 * A failed token exchange must offer retry/sign-out, never a second Privy login.
 */
export function PlatformSessionPanel({
  icon,
  heading,
  description,
}: PlatformSessionPanelProps) {
  const { errorMessage, login, logout, retryExchange, status } = useAuth();
  const isBusy = status === "loading" || status === "exchanging";

  return (
    <main className="auth-page page-shell">
      <section className="auth-panel">
        {icon}
        <h1>
          {isBusy
            ? "Creating your secure MemeTokenHub session…"
            : status === "error"
              ? "Privy connected. Session exchange failed."
              : status === "not-configured"
                ? "Authentication is not configured."
                : heading}
        </h1>
        <p>
          {isBusy
            ? "Your Privy identity is verified. Please wait while we finish the platform token exchange."
            : status === "error"
              ? (errorMessage ??
                "We could not create your MemeTokenHub session. Retry the exchange or sign out.")
              : status === "not-configured"
                ? "Set VITE_PRIVY_APP_ID and VITE_API_BASE_URL to enable this protected experience."
                : description}
        </p>

        {status === "anonymous" && (
          <button
            className="button button-primary"
            type="button"
            onClick={login}
          >
            Connect with Privy
          </button>
        )}
        {isBusy && (
          <button className="button button-primary" type="button" disabled>
            Completing sign in…
          </button>
        )}
        {status === "error" && (
          <div className="hero-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={retryExchange}
            >
              Retry secure session
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => void logout()}
            >
              Sign out
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
