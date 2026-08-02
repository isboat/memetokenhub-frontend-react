import { LogIn, LogOut, LoaderCircle } from "lucide-react";
import { useAuth } from "../auth/authContext";

export function AuthButton() {
  const { status, user, login, logout } = useAuth();
  const isBusy = status === "loading" || status === "exchanging";

  if (status === "authenticated") {
    return (
      <button
        className="button button-secondary compact auth-button"
        type="button"
        onClick={() => void logout()}
      >
        <LogOut size={15} /> <span>{user?.username ?? "Sign out"}</span>
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
