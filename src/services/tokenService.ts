import { gatewayRequest } from "./gatewayClient";

export type FeedType = "trending" | "unclaimed" | "featured" | "new";
export type SentimentWindow = "24h" | "7d" | "30d" | "all";
export type LaunchStatus = "Draft" | "Published" | "Suspended";

export interface TokenSocialLink {
  platform: string;
  url: string;
}
export interface TokenCommunity {
  followersCount: number;
  hotVotes: number;
  notVotes: number;
  sentimentScore: number;
  supportersCount: number;
  updatedAt?: string;
}
export interface TokenProject {
  tokenId: string;
  name: string;
  symbol: string;
  description: string;
  chain?: string;
  network: string;
  contractAddress: string;
  category: string;
  creatorId: string;
  status: string;
  launchStatus: LaunchStatus;
  logoUrl?: string;
  bannerUrl?: string;
  websiteUrl?: string;
  socialLinks?: TokenSocialLink[];
  publishedAt?: string;
  metadata?: {
    supply?: number;
    price?: number;
    marketCap?: number;
    holders?: number;
  };
  community?: TokenCommunity;
  isSponsored?: boolean;
}
export interface TokenAnalytics {
  views?: number;
  holders?: number;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  updatedAt?: string;
}
export interface TokenSentiment {
  hotVotes: number;
  notVotes: number;
  sentimentScore: number;
  updatedAt?: string;
  buckets?: Array<{ timestamp: string; hotVotes: number; notVotes: number }>;
}
export interface NetworkSummary {
  network: string;
  projectCount: number;
}
export interface TokenListFilters {
  search?: string;
  chain?: string;
  network?: string;
  category?: string;
  status?: string;
  creatorId?: string;
  sortBy?: "popularity" | "createdAt";
  limit?: number;
  offset?: number;
}
export interface TokenWriteInput {
  name: string;
  symbol: string;
  description: string;
  network: string;
  contractAddress: string;
  category: string;
  logoUrl?: string;
  bannerUrl?: string;
  websiteUrl?: string;
  socialLinks?: TokenSocialLink[];
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok)
    throw new Error(
      response.status === 403
        ? "You do not have permission to manage this project."
        : response.status === 404
          ? "The requested project was not found."
          : "The Token Service request failed. Please try again.",
    );
  return (await response.json()) as T;
}
async function readList<T>(response: Response): Promise<T[]> {
  const payload = await readJson<T[] | { items: T[] }>(response);
  return Array.isArray(payload) ? payload : payload.items;
}
function queryString(values: object) {
  const query = new URLSearchParams();
  Object.entries(values as Record<string, string | number | undefined>).forEach(
    ([key, value]) => {
      if (value !== undefined && value !== "") query.set(key, String(value));
    },
  );
  return query.toString();
}

export async function listTokens(filters: TokenListFilters = {}) {
  const query = queryString(filters);
  return readList<TokenProject>(
    await gatewayRequest(`/api/tokens${query ? `?${query}` : ""}`),
  );
}
export async function getToken(tokenId: string) {
  return readJson<TokenProject>(
    await gatewayRequest(`/api/tokens/${encodeURIComponent(tokenId)}`),
  );
}
export async function createToken(input: TokenWriteInput) {
  return readJson<TokenProject>(
    await gatewayRequest("/api/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}
export async function updateToken(
  tokenId: string,
  input: Partial<TokenWriteInput>,
) {
  return readJson<TokenProject>(
    await gatewayRequest(`/api/tokens/${encodeURIComponent(tokenId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}
export async function getTokenFeed(type: FeedType, limit = 12) {
  return readList<TokenProject>(
    await gatewayRequest(`/api/tokens/feeds/${type}?limit=${limit}`),
  );
}
export async function getTokenAnalytics(tokenId: string) {
  return readJson<TokenAnalytics>(
    await gatewayRequest(
      `/api/tokens/analytics/${encodeURIComponent(tokenId)}`,
    ),
  );
}
export async function getCreatorTokens(userId: string, limit = 20, offset = 0) {
  return readList<TokenProject>(
    await gatewayRequest(
      `/api/tokens/by-creator/${encodeURIComponent(userId)}?limit=${limit}&offset=${offset}`,
    ),
  );
}
export async function getNetworks() {
  return readJson<NetworkSummary[]>(
    await gatewayRequest("/api/tokens/networks"),
  );
}
export async function getTokenSentiment(
  tokenId: string,
  window: SentimentWindow,
) {
  return readJson<TokenSentiment>(
    await gatewayRequest(
      `/api/tokens/${encodeURIComponent(tokenId)}/sentiment?window=${window}`,
    ),
  );
}
export async function publishToken(tokenId: string) {
  return readJson<TokenProject>(
    await gatewayRequest(`/api/tokens/${encodeURIComponent(tokenId)}/publish`, {
      method: "POST",
    }),
  );
}
export async function requestMediaUpload(input: {
  fileName: string;
  contentType: string;
  assetType: "Logo" | "Banner";
}) {
  return readJson<{ uploadUrl: string; assetUrl: string; expiresAt: string }>(
    await gatewayRequest("/api/tokens/media/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}
export async function uploadProjectMedia(
  file: File,
  assetType: "Logo" | "Banner",
) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw new Error("Use a PNG, JPEG, or WebP image.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Project images must be 5 MB or smaller.");
  const signed = await requestMediaUpload({
    fileName: file.name,
    contentType: file.type,
    assetType,
  });
  const upload = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!upload.ok) throw new Error("The project image upload failed.");
  return signed.assetUrl;
}
