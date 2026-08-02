import { gatewayRequest } from "./gatewayClient";

export type NotificationEventType =
  | "ClaimApproval"
  | "ClaimUpdate"
  | "ProjectPublished"
  | "KolSupportedToken"
  | "NewFollower"
  | "NewPost"
  | "VoteMilestone"
  | "Subscription"
  | "PaymentConfirmed";
export type NotificationChannel = "InApp" | "Email" | "Push";
export type DigestFrequency = "Immediate" | "Daily" | "Weekly" | "Off";

export interface HubNotification {
  notificationId: string;
  userId: string;
  type: NotificationEventType;
  title?: string;
  message: string;
  channels: NotificationChannel[];
  status: "Sent" | "Delivered" | "Failed";
  actionUrl?: string;
  isRead: boolean;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface NotificationPreferences {
  userId?: string;
  channels: Record<NotificationChannel, boolean>;
  events: Partial<
    Record<NotificationEventType, Partial<Record<NotificationChannel, boolean>>>
  >;
  digestFrequency: DigestFrequency;
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Sign in to view notifications."
        : response.status === 403
          ? "You cannot access another user's notifications."
          : response.status === 404
            ? "That notification could not be found."
            : response.status === 422
              ? "Those notification preferences were not accepted."
              : response.status === 429
                ? "Too many notification requests. Please try again shortly."
                : "The Notification Service request failed.",
    );
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function list<T>(response: Response) {
  const data = await parse<T[] | { items: T[] }>(response);
  return Array.isArray(data) ? data : data.items;
}

function put(value?: unknown): RequestInit {
  return {
    method: "PUT",
    ...(value === undefined
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        }),
  };
}

/** Compatibility route; the server must enforce path subject ownership. */
export async function getUserNotifications(userId: string) {
  return list<HubNotification>(
    await gatewayRequest(`/api/notifications/${encodeURIComponent(userId)}`),
  );
}

/** Compatibility route; new screens should use the subject-derived me route. */
export async function updateUserNotificationPreferences(
  userId: string,
  preferences: NotificationPreferences,
) {
  return parse<NotificationPreferences>(
    await gatewayRequest(
      `/api/notifications/${encodeURIComponent(userId)}/preferences`,
      put(preferences),
    ),
  );
}

export async function getMyNotifications(
  unreadOnly = false,
  limit = 20,
  offset = 0,
) {
  return list<HubNotification>(
    await gatewayRequest(
      `/api/notifications/me?unreadOnly=${unreadOnly}&limit=${limit}&offset=${offset}`,
    ),
  );
}

export async function getMyNotificationPreferences() {
  return parse<NotificationPreferences>(
    await gatewayRequest("/api/notifications/me/preferences"),
  );
}

export async function updateMyNotificationPreferences(
  preferences: NotificationPreferences,
) {
  return parse<NotificationPreferences>(
    await gatewayRequest("/api/notifications/me/preferences", put(preferences)),
  );
}

export async function markNotificationRead(notificationId: string) {
  return parse<HubNotification>(
    await gatewayRequest(
      `/api/notifications/${encodeURIComponent(notificationId)}/read`,
      put(),
    ),
  );
}

export async function markAllNotificationsRead() {
  await parse<void>(await gatewayRequest("/api/notifications/read-all", put()));
}

// POST /api/notifications/send is internal-only and must never be callable here.
