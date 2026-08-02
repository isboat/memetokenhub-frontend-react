export interface PlatformUser {
  userId: string;
  username?: string;
  displayName?: string;
  email?: string;
  walletAddress?: string;
  role?: string;
  accountType?: string;
  isVerified?: boolean;
  capabilities?: string[];
  profile?: UserProfile;
  preferences?: UserPreferences;
}

export interface SocialChannel {
  platform: string;
  handle?: string;
  verified: boolean;
  verifiedAt?: string;
}

export interface UserProfile {
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  socialLinks?: string[];
  socialChannels?: SocialChannel[];
  reputationScore?: number;
  badges?: string[];
  followerCount?: number;
  projectsCount?: number;
}

export interface UserPreferences {
  notificationsEnabled?: boolean;
  theme?: string;
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
