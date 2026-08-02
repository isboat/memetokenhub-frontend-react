import { LogIn, LogOut, LoaderCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../auth/authContext";
import { Link } from "react-router-dom";

export function AuthButton() {
  const { status, user, errorMessage, login, logout, retryExchange } =
    useAuth();
  const isBusy = status === "loading" || status === "exchanging";

  if (status === "authenticated") {
    return (
      <span className="authenticated-actions">
        <Link
          className="button button-secondary compact auth-button"
          to="/profile"
        >
          <span>{user?.username ?? "Profile"}</span>
        </Link>
        <button
          className="icon-button"
          type="button"
          aria-label="Sign out"
          onClick={() => void logout()}
        >
          <LogOut size={15} />
        </button>
      </span>
    );
  }

  if (status === "error") {
    return (
      <button
        className="button button-error compact auth-button"
        type="button"
        title={errorMessage ?? "The MemeTokenHub session could not be created."}
        onClick={retryExchange}
      >
        <RefreshCw size={15} /> <span>Retry session</span>
      </button>
    );
  }

  return (
    <button
      className="button button-primary compact auth-button"
      type="button"
      disabled={isBusy || status === "not-configured"}
      title={
        status === "not-configured"
          ? "Configure VITE_PRIVY_APP_ID to enable sign in"
          : undefined
      }
      onClick={login}
    >
      {isBusy ? (
        <LoaderCircle className="spin" size={15} />
      ) : (
        <LogIn size={15} />
      )}
      <span>{status === "exchanging" ? "Connecting…" : "Connect"}</span>
    </button>
  );
}
