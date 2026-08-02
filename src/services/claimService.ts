import { gatewayRequest } from "./gatewayClient";

export type ClaimType =
  "ProjectOwnership" | "SocialIdentity" | "OfficialRepresentative";
export type ClaimStatus = "Pending" | "Approved" | "Rejected" | "Appealed";
export type ReviewDecision = "Approved" | "Rejected";

export interface ClaimProofFields {
  proofMethod?: string;
  socialLinks?: string[];
  walletTx?: string;
  siteProof?: string;
  [key: string]: unknown;
}

/** Private owner/moderator DTO. This must never be used on public pages. */
export interface Claim {
  claimId: string;
  userId: string;
  tokenId: string;
  type: ClaimType;
  description: string;
  attachments: string[];
  proofFields: ClaimProofFields;
  status: ClaimStatus;
  reviewerId?: string;
  reviewNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  appealedAt?: string;
}

/** Deliberately redacted response shape used by the public verification page. */
export interface PublicClaimStatus {
  claimId: string;
  userId: string;
  tokenId: string;
  type: ClaimType;
  status: ClaimStatus;
  submittedAt?: string;
  reviewedAt?: string;
  verifiedAt?: string;
}

export interface ClaimSubmission {
  tokenId: string;
  type: ClaimType;
  description: string;
  attachments: string[];
  proofFields: ClaimProofFields;
}

export interface ReviewedClaimFilters {
  status?: ReviewDecision;
  reviewerId?: string;
  limit?: number;
  offset?: number;
}

export interface SignedClaimUpload {
  uploadUrl: string;
  objectUrl?: string;
  fileUrl?: string;
  headers?: Record<string, string>;
}

const approvedAttachmentTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
]);
const maximumAttachmentBytes = 10 * 1024 * 1024;

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message =
      response.status === 401
        ? "Sign in to manage claims."
        : response.status === 403
          ? "You do not have permission to perform this claim action."
          : response.status === 404
            ? "That claim could not be found."
            : response.status === 409
              ? "This claim has already changed. Refresh before trying again."
              : response.status === 422
                ? "The claim evidence was not accepted. Check the form and attachments."
                : response.status === 429
                  ? "Too many claim requests. Please wait and try again."
                  : "The Claim Service request failed.";
    throw new Error(message);
  }
  return (await response.json()) as T;
}

async function parseList<T>(response: Response) {
  const result = await parseResponse<T[] | { items: T[] }>(response);
  return Array.isArray(result) ? result : result.items;
}

function jsonBody(value: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  };
}

export async function submitClaim(input: ClaimSubmission) {
  return parseResponse<Claim>(
    await gatewayRequest("/api/claims", jsonBody(input)),
  );
}

export async function getUserClaims(userId: string) {
  return parseList<Claim>(
    await gatewayRequest(`/api/claims/${encodeURIComponent(userId)}`),
  );
}

export async function getPendingClaims() {
  return parseList<Claim>(await gatewayRequest("/api/claims/pending"));
}

export async function reviewClaim(
  claimId: string,
  status: ReviewDecision,
  notes: string,
) {
  return parseResponse<Claim>(
    await gatewayRequest(`/api/claims/${encodeURIComponent(claimId)}/review`, {
      ...jsonBody({ status, notes }),
      method: "PUT",
    }),
  );
}

export async function getPublicClaimStatus(claimId: string) {
  return parseResponse<PublicClaimStatus>(
    await gatewayRequest(
      `/api/claims/${encodeURIComponent(claimId)}/public-status`,
    ),
  );
}

export async function getReviewedClaims(filters: ReviewedClaimFilters = {}) {
  const query = new URLSearchParams({
    limit: String(filters.limit ?? 20),
    offset: String(filters.offset ?? 0),
  });
  if (filters.status) query.set("status", filters.status);
  if (filters.reviewerId) query.set("reviewerId", filters.reviewerId);
  return parseList<Claim>(
    await gatewayRequest(`/api/claims/reviewed?${query}`),
  );
}

export async function appealClaim(
  claimId: string,
  input: {
    reason: string;
    proofFields: ClaimProofFields;
    attachments: string[];
  },
) {
  return parseResponse<Claim>(
    await gatewayRequest(
      `/api/claims/${encodeURIComponent(claimId)}/appeal`,
      jsonBody(input),
    ),
  );
}

export async function requestClaimAttachmentUpload(input: {
  fileName: string;
  contentType: string;
}) {
  return parseResponse<SignedClaimUpload>(
    await gatewayRequest("/api/claims/attachments/upload-url", jsonBody(input)),
  );
}

/** Uploads proof directly to signed storage so raw evidence never passes through app state. */
export async function uploadClaimAttachment(file: File) {
  if (!approvedAttachmentTypes.has(file.type))
    throw new Error("Claim evidence must be a PNG, JPEG, WebP, or PDF file.");
  if (file.size > maximumAttachmentBytes)
    throw new Error("Claim evidence must be 10 MB or smaller.");

  const signedUpload = await requestClaimAttachmentUpload({
    fileName: file.name,
    contentType: file.type,
  });
  const response = await fetch(signedUpload.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type, ...signedUpload.headers },
    body: file,
  });
  if (!response.ok) throw new Error("The evidence upload failed.");
  const objectUrl = signedUpload.objectUrl ?? signedUpload.fileUrl;
  if (!objectUrl)
    throw new Error("The upload completed without an evidence reference.");
  return objectUrl;
}
