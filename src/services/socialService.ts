import { gatewayRequest } from "./gatewayClient";

export type FollowTargetType = "User" | "Token" | "Network";
export type VoteValue = "Hot" | "NotHot";
export type PostAccess = "Public" | "Subscribers";
export interface Follow {
  targetType: FollowTargetType;
  targetId: string;
  createdAt?: string;
}
export interface Activity {
  activityId: string;
  userId: string;
  type: string;
  description: string;
  targetId?: string;
  createdAt: string;
}
export interface Reputation {
  userId: string;
  score: number;
  badges: string[];
  claimsApproved: number;
  tokensPublished: number;
  followersCount: number;
  updatedAt: string;
}
export interface Comment {
  engagementId: string;
  userId: string;
  content: string;
  createdAt: string;
}
export interface TokenEngagement {
  likes: number;
  comments: Comment[];
  viewerLiked?: boolean;
  updatedAt?: string;
}
export interface TokenSupport {
  supportId: string;
  kolUserId: string;
  tokenId: string;
  statement?: string;
  createdAt: string;
  withdrawnAt?: string;
}
export interface TokenVote {
  hotVotes: number;
  notHotVotes: number;
  viewerVote?: VoteValue;
  updatedAt?: string;
}
export interface SocialPost {
  postId: string;
  authorId: string;
  tokenId?: string;
  content: string;
  mediaUrls: string[];
  access: PostAccess;
  createdAt: string;
  updatedAt?: string;
  moderationStatus?: string;
}
export interface PostFilters {
  authorId?: string;
  tokenId?: string;
  access?: PostAccess;
  limit?: number;
  offset?: number;
}

async function json<T>(response: Response): Promise<T> {
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Sign in to continue."
        : response.status === 403
          ? "You do not have permission for this social action."
          : response.status === 429
            ? "You are doing that too quickly. Please wait and try again."
            : "The Social Service request failed.",
    );
  return (await response.json()) as T;
}
async function list<T>(response: Response) {
  const data = await json<T[] | { items: T[] }>(response);
  return Array.isArray(data) ? data : data.items;
}
const paging = (limit = 20, offset = 0) => `limit=${limit}&offset=${offset}`;
const body = (value: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(value),
});
export async function followUser(followingId: string) {
  return json<Follow>(
    await gatewayRequest("/api/social/follow", body({ followingId })),
  );
}
export async function unfollowUser(followingId: string) {
  return json<Follow>(
    await gatewayRequest("/api/social/unfollow", body({ followingId })),
  );
}
export async function getFollowers(userId: string, limit = 20, offset = 0) {
  return list<Follow>(
    await gatewayRequest(
      `/api/social/followers/${encodeURIComponent(userId)}?${paging(limit, offset)}`,
    ),
  );
}
export async function getFollowing(userId: string, limit = 20, offset = 0) {
  return list<Follow>(
    await gatewayRequest(
      `/api/social/following/${encodeURIComponent(userId)}?${paging(limit, offset)}`,
    ),
  );
}
export async function getFeed(userId: string, limit = 20, offset = 0) {
  return list<Activity>(
    await gatewayRequest(
      `/api/social/feed/${encodeURIComponent(userId)}?${paging(limit, offset)}`,
    ),
  );
}
export async function getActivities(userId: string, limit = 20, offset = 0) {
  return list<Activity>(
    await gatewayRequest(
      `/api/social/activities/${encodeURIComponent(userId)}?${paging(limit, offset)}`,
    ),
  );
}
export async function getCreatorLeaderboard(limit = 10) {
  return list<Reputation>(
    await gatewayRequest(`/api/social/leaderboard/creators?limit=${limit}`),
  );
}
export async function getCollectorLeaderboard(limit = 10) {
  return list<Reputation>(
    await gatewayRequest(`/api/social/leaderboard/collectors?limit=${limit}`),
  );
}
export async function getReputation(userId: string) {
  return json<Reputation>(
    await gatewayRequest(
      `/api/social/reputation/${encodeURIComponent(userId)}`,
    ),
  );
}
export async function likeToken(tokenId: string) {
  return json<TokenEngagement>(
    await gatewayRequest(
      `/api/social/tokens/${encodeURIComponent(tokenId)}/like`,
      { method: "POST" },
    ),
  );
}
export async function commentOnToken(tokenId: string, content: string) {
  return json<Comment>(
    await gatewayRequest(
      `/api/social/tokens/${encodeURIComponent(tokenId)}/comment`,
      body({ content }),
    ),
  );
}
export async function getTokenEngagement(tokenId: string) {
  return json<TokenEngagement>(
    await gatewayRequest(
      `/api/social/tokens/${encodeURIComponent(tokenId)}/engagement`,
    ),
  );
}
export async function followTarget(
  targetType: FollowTargetType,
  targetId: string,
) {
  return json<Follow>(
    await gatewayRequest("/api/social/follows", body({ targetType, targetId })),
  );
}
export async function unfollowTarget(
  targetType: FollowTargetType,
  targetId: string,
) {
  const response = await gatewayRequest(
    `/api/social/follows/${targetType}/${encodeURIComponent(targetId)}`,
    { method: "DELETE" },
  );
  if (!response.ok) await json(response);
}
export async function getMyFollows(
  targetType?: FollowTargetType,
  limit = 20,
  offset = 0,
) {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (targetType) query.set("targetType", targetType);
  return list<Follow>(await gatewayRequest(`/api/social/follows/me?${query}`));
}
export async function supportToken(tokenId: string, statement: string) {
  return json<TokenSupport>(
    await gatewayRequest(
      `/api/social/tokens/${encodeURIComponent(tokenId)}/support`,
      body({ statement }),
    ),
  );
}
export async function withdrawTokenSupport(tokenId: string) {
  const response = await gatewayRequest(
    `/api/social/tokens/${encodeURIComponent(tokenId)}/support`,
    { method: "DELETE" },
  );
  if (!response.ok) await json(response);
}
export async function getTokenSupporters(
  tokenId: string,
  includeWithdrawn = false,
  limit = 20,
  offset = 0,
) {
  return list<TokenSupport>(
    await gatewayRequest(
      `/api/social/tokens/${encodeURIComponent(tokenId)}/supporters?includeWithdrawn=${includeWithdrawn}&${paging(limit, offset)}`,
    ),
  );
}
export async function voteOnToken(tokenId: string, value: VoteValue) {
  return json<TokenVote>(
    await gatewayRequest(
      `/api/social/tokens/${encodeURIComponent(tokenId)}/vote`,
      body({ value }),
    ),
  );
}
export async function removeTokenVote(tokenId: string) {
  const response = await gatewayRequest(
    `/api/social/tokens/${encodeURIComponent(tokenId)}/vote`,
    { method: "DELETE" },
  );
  if (!response.ok) await json(response);
}
export async function getTokenVote(tokenId: string) {
  return json<TokenVote>(
    await gatewayRequest(
      `/api/social/tokens/${encodeURIComponent(tokenId)}/vote`,
    ),
  );
}
export async function createPost(input: {
  tokenId?: string;
  content: string;
  mediaUrls: string[];
  access: PostAccess;
}) {
  return json<SocialPost>(
    await gatewayRequest("/api/social/posts", body(input)),
  );
}
export async function updatePost(
  postId: string,
  input: Partial<Pick<SocialPost, "content" | "mediaUrls" | "access">>,
) {
  return json<SocialPost>(
    await gatewayRequest(`/api/social/posts/${encodeURIComponent(postId)}`, {
      ...body(input),
      method: "PUT",
    }),
  );
}
export async function deletePost(postId: string) {
  const response = await gatewayRequest(
    `/api/social/posts/${encodeURIComponent(postId)}`,
    { method: "DELETE" },
  );
  if (!response.ok) await json(response);
}
export async function getPost(postId: string) {
  return json<SocialPost>(
    await gatewayRequest(`/api/social/posts/${encodeURIComponent(postId)}`),
  );
}
export async function getPosts(filters: PostFilters = {}) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  return list<SocialPost>(
    await gatewayRequest(`/api/social/posts${query.size ? `?${query}` : ""}`),
  );
}
