import type { TokenExchangeResponse } from "../auth/authTypes";

export class AuthenticationExchangeError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthenticationExchangeError";
    this.status = status;
  }
}

/** Exchanges a short-lived Privy token for the platform JWT used by services. */
export async function exchangePrivyToken(
  privyToken: string,
  signal?: AbortSignal,
): Promise<TokenExchangeResponse> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
  if (!apiBaseUrl) {
    throw new AuthenticationExchangeError(
      "VITE_API_BASE_URL is required for authentication.",
    );
  }

  const response = await fetch(`${apiBaseUrl}/api/users/auth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ privyToken }),
    signal,
  });

  if (!response.ok) {
    throw new AuthenticationExchangeError(
      response.status === 401
        ? "Your Privy session could not be verified. Please sign in again."
        : "We could not finish signing you in. Please try again.",
      response.status,
    );
  }

  const exchangeResponse =
    (await response.json()) as Partial<TokenExchangeResponse>;
  if (!exchangeResponse.jwtToken || !exchangeResponse.user?.userId) {
    throw new AuthenticationExchangeError(
      "The authentication service returned an invalid response.",
    );
  }

  return exchangeResponse as TokenExchangeResponse;
}
