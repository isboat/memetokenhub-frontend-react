export interface PlatformUser {
  userId: string;
  username?: string;
  email?: string;
  walletAddress?: string;
  role?: string;
}

export interface TokenExchangeResponse {
  jwtToken: string;
  user: PlatformUser;
}

export type AuthenticationStatus =
  | "loading"
  | "anonymous"
  | "exchanging"
  | "authenticated"
  | "error"
  | "not-configured";
