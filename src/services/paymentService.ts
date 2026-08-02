import { gatewayRequest } from "./gatewayClient";

export type PaymentStatus = "Pending" | "Completed" | "Failed";
export type PaymentPurpose =
  "TokenPurchase" | "CreatorSubscription" | "Tip" | "PremiumPost";

export interface Payment {
  paymentId: string;
  userId: string;
  tokenId?: string;
  creatorId?: string;
  postId?: string;
  purpose: PaymentPurpose;
  amount: number;
  currency: string;
  platformFee?: number;
  creatorAmount?: number;
  status: PaymentStatus;
  receiptUrl?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CheckoutSession {
  checkoutId?: string;
  checkoutUrl: string;
  amount: number;
  currency: string;
  platformFee?: number;
  creatorAmount?: number;
  renewalTerms?: string;
  expiresAt?: string;
}

export interface Entitlement {
  entitlementId: string;
  purpose: "CreatorSubscription" | "PremiumPost";
  creatorId: string;
  postId?: string;
  subscriptionId?: string;
  status: "Active" | "Expired" | "Cancelled";
  startsAt: string;
  expiresAt?: string;
  renews?: boolean;
}

export interface CreatorEarningsSummary {
  creatorId: string;
  currency: string;
  grossAmount: number;
  platformFees: number;
  netAmount: number;
  transactions: Payment[];
  from?: string;
  to?: string;
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Sign in to manage payments."
        : response.status === 403
          ? "You do not have permission to access this payment resource."
          : response.status === 404
            ? "The payment resource could not be found."
            : response.status === 409
              ? "This payment request has already been processed."
              : response.status === 422
                ? "The server could not validate that payment offer."
                : response.status === 429
                  ? "Too many payment requests. Please wait and try again."
                  : "The Payment Service request failed.",
    );
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function list<T>(response: Response) {
  const data = await parse<T[] | { items: T[] }>(response);
  return Array.isArray(data) ? data : data.items;
}

function post(value: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  };
}

export async function startTokenCheckout(input: {
  userId: string;
  tokenId: string;
  amount: number;
}) {
  return parse<CheckoutSession>(
    await gatewayRequest("/api/payments/checkout", post(input)),
  );
}

/** The Helio confirmation webhook is intentionally not exposed to browser code. */
export async function getPaymentHistory(userId: string) {
  return list<Payment>(
    await gatewayRequest(`/api/payments/${encodeURIComponent(userId)}/history`),
  );
}

export async function startCreatorCheckout(input: {
  creatorId: string;
  purpose: Exclude<PaymentPurpose, "TokenPurchase">;
  postId?: string;
  amount: number;
  currency: string;
}) {
  return parse<CheckoutSession>(
    await gatewayRequest("/api/payments/creator-checkout", post(input)),
  );
}

export async function getMyEntitlements(
  filters: {
    creatorId?: string;
    postId?: string;
  } = {},
) {
  const query = new URLSearchParams();
  if (filters.creatorId) query.set("creatorId", filters.creatorId);
  if (filters.postId) query.set("postId", filters.postId);
  return list<Entitlement>(
    await gatewayRequest(
      `/api/payments/me/entitlements${query.size ? `?${query}` : ""}`,
    ),
  );
}

export async function cancelSubscription(subscriptionId: string) {
  await parse<void>(
    await gatewayRequest(
      `/api/payments/subscriptions/${encodeURIComponent(subscriptionId)}`,
      { method: "DELETE" },
    ),
  );
}

export async function getMyCreatorEarnings(
  filters: {
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  } = {},
) {
  const query = new URLSearchParams({
    limit: String(filters.limit ?? 20),
    offset: String(filters.offset ?? 0),
  });
  if (filters.from) query.set("from", filters.from);
  if (filters.to) query.set("to", filters.to);
  return parse<CreatorEarningsSummary>(
    await gatewayRequest(`/api/payments/creators/me/earnings?${query}`),
  );
}
