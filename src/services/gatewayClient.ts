import { clearPlatformJwt, getPlatformJwt } from "../auth/platformTokenStore";

/** Sends an API Gateway request with the backend-issued JWT when available. */
export async function gatewayRequest(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
  if (!apiBaseUrl) throw new Error("VITE_API_BASE_URL is not configured.");

  const headers = new Headers(init.headers);
  const platformJwt = getPlatformJwt();
  if (platformJwt) headers.set("Authorization", `Bearer ${platformJwt}`);

  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  if (response.status === 401) clearPlatformJwt();
  return response;
}
