import type { TokenExchangeResponse } from "../auth/authTypes";
import type { PlatformUser, SocialChannel } from "../auth/authTypes";
import { gatewayRequest } from "./gatewayClient";

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

export interface UserSearchFilters {
  query: string;
  limit?: number;
  accountType?: string;
  verified?: boolean;
  network?: string;
}

export interface CreateUserInput {
  userId: string;
  username: string;
  email?: string;
  walletAddress?: string;
}

export interface UpdateUserInput {
  username?: string;
  displayName?: string;
  accountType?: string;
  profile?: {
    bio?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    socialLinks?: string[];
  };
  preferences?: { notificationsEnabled?: boolean; theme?: string };
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(
      response.status === 403
        ? "You do not have permission to perform this action."
        : response.status === 404
          ? "The requested user was not found."
          : "The User Service request failed. Please try again.",
    );
  }
  return (await response.json()) as T;
}

export async function getUser(userId: string) {
  return readJson<PlatformUser>(
    await gatewayRequest(`/api/users/${encodeURIComponent(userId)}`),
  );
}

export async function getCurrentUser() {
  return readJson<PlatformUser>(await gatewayRequest("/api/users/me"));
}

export async function searchUsers(filters: UserSearchFilters) {
  const parameters = new URLSearchParams({ query: filters.query });
  if (filters.limit) parameters.set("limit", String(filters.limit));
  if (filters.accountType) parameters.set("accountType", filters.accountType);
  if (filters.verified !== undefined)
    parameters.set("verified", String(filters.verified));
  if (filters.network) parameters.set("network", filters.network);
  return readJson<PlatformUser[]>(
    await gatewayRequest(`/api/users/search?${parameters}`),
  );
}

export async function createUser(input: CreateUserInput) {
  return readJson<PlatformUser>(
    await gatewayRequest("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  return readJson<PlatformUser>(
    await gatewayRequest(`/api/users/${encodeURIComponent(userId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function deactivateUser(userId: string) {
  const response = await gatewayRequest(
    `/api/users/${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
    },
  );
  if (!response.ok) await readJson(response);
}

export async function verifyWallet(userId: string, proof: string) {
  return readJson<{ verified: boolean }>(
    await gatewayRequest(
      `/api/users/${encodeURIComponent(userId)}/verify-wallet`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof }),
      },
    ),
  );
}

export async function updateUserRole(userId: string, role: string) {
  return readJson<PlatformUser>(
    await gatewayRequest(`/api/users/${encodeURIComponent(userId)}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }),
  );
}

export async function getSocialChannels(userId: string) {
  return readJson<SocialChannel[]>(
    await gatewayRequest(
      `/api/users/${encodeURIComponent(userId)}/social-channels`,
    ),
  );
}

export async function connectSocialChannel(
  userId: string,
  input: { platform: string; authorizationCode: string; redirectUri: string },
) {
  return readJson<SocialChannel>(
    await gatewayRequest(
      `/api/users/${encodeURIComponent(userId)}/social-channels`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    ),
  );
}

export async function disconnectSocialChannel(
  userId: string,
  platform: string,
) {
  const response = await gatewayRequest(
    `/api/users/${encodeURIComponent(userId)}/social-channels/${encodeURIComponent(platform)}`,
    { method: "DELETE" },
  );
  if (!response.ok) await readJson(response);
}

export async function verifySocialChannel(
  userId: string,
  platform: string,
  challengeResponse: string,
) {
  return readJson<SocialChannel>(
    await gatewayRequest(
      `/api/users/${encodeURIComponent(userId)}/social-channels/${encodeURIComponent(platform)}/verify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeResponse }),
      },
    ),
  );
}
