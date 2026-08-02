export type TokenStatus = "Trending" | "New" | "Verified";

export interface MemeToken {
  id: string;
  name: string;
  symbol: string;
  description: string;
  network: string;
  price: string;
  change: number;
  marketCap: string;
  supporters: string;
  sentiment: number;
  status: TokenStatus;
  colors: [string, string];
  mascot: string;
}

export interface CommunityLeader {
  name: string;
  handle: string;
  followers: string;
  badge: string;
  avatar: string;
  verified: boolean;
}
