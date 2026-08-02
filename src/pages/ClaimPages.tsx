import {
  BadgeCheck,
  FileCheck2,
  Gavel,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { PlatformSessionPanel } from "../components/PlatformSessionPanel";
import {
  appealClaim,
  type Claim,
  type ClaimStatus,
  type ClaimType,
  getPendingClaims,
  getPublicClaimStatus,
  getReviewedClaims,
  getUserClaims,
  type PublicClaimStatus,
  reviewClaim,
  submitClaim,
  uploadClaimAttachment,
} from "../services/claimService";

const claimTypes: { value: ClaimType; label: string; help: string }[] = [
  {
    value: "ProjectOwnership",
    label: "Project ownership",
    help: "Prove control of the token contract or official project site.",
  },
  {
    value: "SocialIdentity",
    label: "Social identity",
    help: "Connect an official social channel to your Hub identity.",
  },
  {
    value: "OfficialRepresentative",
    label: "Official representative",
    help: "Show that you are authorized to represent the project.",
  },
];

function StatusPill({ status }: { status: ClaimStatus }) {
  return (
    <span className={`claim-status ${status.toLowerCase()}`}>{status}</span>
  );
}

function formatDate(value?: string) {
  return value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "Not yet";
}

function SignInPanel() {
  return (
    <PlatformSessionPanel
      icon={<LockKeyhole />}
      heading="Connect to manage claims."
      description="Your private proof and claim history are available only to you."
    />
  );
}

export function ClaimCenterPage() {
  const { status, user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [tokenId, setTokenId] = useState("");
  const [type, setType] = useState<ClaimType>("ProjectOwnership");
  const [description, setDescription] = useState("");
  const [proofMethod, setProofMethod] = useState("ContractWalletSignature");
  const [proofReference, setProofReference] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [appealId, setAppealId] = useState("");
  const [appealReason, setAppealReason] = useState("");
  const [appealProofMethod, setAppealProofMethod] = useState(
    "ContractWalletSignature",
  );
  const [appealProofReference, setAppealProofReference] = useState("");
  const [appealAttachments, setAppealAttachments] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && user)
      getUserClaims(user.userId)
        .then(setClaims)
        .catch((error: unknown) =>
          setMessage(
            error instanceof Error
              ? error.message
              : "Claims could not be loaded.",
          ),
        );
  }, [status, user]);

  if (status !== "authenticated" || !user) return <SignInPanel />;

  async function uploadEvidence(file?: File) {
    if (!file) return;
    setBusy(true);
    setMessage("Uploading evidence for security scanning…");
    try {
      const url = await uploadClaimAttachment(file);
      setAttachments((current) => [...current, url]);
      setMessage("Evidence uploaded. It will be scanned before moderation.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadAppealEvidence(file?: File) {
    if (!file) return;
    setBusy(true);
    setMessage("Uploading additional appeal evidence…");
    try {
      const url = await uploadClaimAttachment(file);
      setAppealAttachments((current) => [...current, url]);
      setMessage("Appeal evidence uploaded and queued for scanning.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("Submitting an immutable evidence snapshot…");
    try {
      const proofFields = {
        proofMethod,
        ...(proofMethod === "ConnectedSocial"
          ? { socialLinks: [proofReference] }
          : proofMethod === "DnsSiteProof"
            ? { siteProof: proofReference }
            : { walletTx: proofReference }),
      };
      const claim = await submitClaim({
        tokenId,
        type,
        description,
        attachments,
        proofFields,
      });
      setClaims((current) => [claim, ...current]);
      setTokenId("");
      setDescription("");
      setProofReference("");
      setAttachments([]);
      setMessage("Claim submitted for moderator review.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Claim submission failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitAppeal(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const updated = await appealClaim(appealId, {
        reason: appealReason,
        proofFields: {
          proofMethod: appealProofMethod,
          ...(appealProofReference
            ? appealProofMethod === "ConnectedSocial"
              ? { socialLinks: [appealProofReference] }
              : appealProofMethod === "DnsSiteProof"
                ? { siteProof: appealProofReference }
                : { walletTx: appealProofReference }
            : {}),
        },
        attachments: appealAttachments,
      });
      setClaims((current) =>
        current.map((claim) =>
          claim.claimId === updated.claimId ? updated : claim,
        ),
      );
      setAppealId("");
      setAppealReason("");
      setAppealProofReference("");
      setAppealAttachments([]);
      setMessage(
        "Appeal submitted. Only one appeal is allowed per rejected claim.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Appeal failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="claims-page page-shell">
      <header className="claims-hero">
        <span className="eyebrow purple">
          <ShieldCheck size={14} /> Verification center
        </span>
        <h1>Prove what you represent.</h1>
        <p>
          Submit private evidence for project ownership, social identity, or
          official representation. Only a redacted verification status is
          public.
        </p>
      </header>
      <div className="claims-layout">
        <form className="claim-form claim-panel" onSubmit={submit}>
          <div className="claim-panel-heading">
            <FileCheck2 />
            <div>
              <h2>New claim</h2>
              <p>Evidence is private to you and authorized moderators.</p>
            </div>
          </div>
          <label>
            Token or project ID
            <input
              value={tokenId}
              onChange={(event) => setTokenId(event.target.value)}
              required
              placeholder="project-token-id"
            />
          </label>
          <label>
            Claim type
            <select
              value={type}
              onChange={(event) => setType(event.target.value as ClaimType)}
            >
              {claimTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <small>
              {claimTypes.find((item) => item.value === type)?.help}
            </small>
          </label>
          <label>
            Proof method
            <select
              value={proofMethod}
              onChange={(event) => setProofMethod(event.target.value)}
            >
              <option value="ContractWalletSignature">
                Contract-wallet signature
              </option>
              <option value="DnsSiteProof">DNS or site proof</option>
              <option value="ConnectedSocial">Connected social channel</option>
            </select>
          </label>
          <label>
            Proof reference
            <input
              value={proofReference}
              onChange={(event) => setProofReference(event.target.value)}
              required
              placeholder="Transaction, DNS record, or verified HTTPS URL"
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              minLength={20}
              rows={4}
              placeholder="Explain how this evidence proves your relationship to the project."
            />
          </label>
          <label className="claim-upload">
            <Upload size={18} />
            <span>Attach PNG, JPEG, WebP, or PDF (10 MB max)</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              disabled={busy}
              onChange={(event) => void uploadEvidence(event.target.files?.[0])}
            />
          </label>
          {attachments.length > 0 && (
            <p className="evidence-count">
              <FileCheck2 size={16} /> {attachments.length} evidence file
              {attachments.length === 1 ? "" : "s"} ready
            </p>
          )}
          <button
            className="button button-primary"
            type="submit"
            disabled={busy}
          >
            {busy ? "Please wait…" : "Submit claim"}
          </button>
        </form>

        <section className="claim-panel claim-history">
          <div className="claim-panel-heading">
            <RotateCcw />
            <div>
              <h2>Your claim history</h2>
              <p>The service remains authoritative for every transition.</p>
            </div>
          </div>
          {message && (
            <p className="form-status" role="status">
              {message}
            </p>
          )}
          {!claims.length && (
            <p className="claim-empty">No claims submitted yet.</p>
          )}
          {claims.map((claim) => (
            <article className="claim-row" key={claim.claimId}>
              <div>
                <span>{claim.type.replace(/([A-Z])/g, " $1").trim()}</span>
                <h3>{claim.tokenId}</h3>
                <p>Submitted {formatDate(claim.submittedAt)}</p>
              </div>
              <StatusPill status={claim.status} />
              {claim.status === "Rejected" && !claim.appealedAt && (
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    setAppealId(claim.claimId);
                    setAppealReason("");
                    setAppealProofReference("");
                    setAppealAttachments([]);
                  }}
                >
                  Appeal decision
                </button>
              )}
              <Link
                className="text-button"
                to={`/claims/${encodeURIComponent(claim.claimId)}/status`}
              >
                View public badge
              </Link>
              {appealId === claim.claimId && (
                <form className="appeal-form" onSubmit={submitAppeal}>
                  <label>
                    Reason for appeal
                    <textarea
                      rows={3}
                      minLength={20}
                      required
                      value={appealReason}
                      onChange={(event) => setAppealReason(event.target.value)}
                    />
                  </label>
                  <label>
                    Additional proof method
                    <select
                      value={appealProofMethod}
                      onChange={(event) =>
                        setAppealProofMethod(event.target.value)
                      }
                    >
                      <option value="ContractWalletSignature">
                        Contract-wallet signature
                      </option>
                      <option value="DnsSiteProof">DNS or site proof</option>
                      <option value="ConnectedSocial">
                        Connected social channel
                      </option>
                    </select>
                  </label>
                  <label>
                    Additional proof reference (optional)
                    <input
                      value={appealProofReference}
                      onChange={(event) =>
                        setAppealProofReference(event.target.value)
                      }
                      placeholder="New transaction, DNS record, or HTTPS URL"
                    />
                  </label>
                  <label className="claim-upload">
                    <Upload size={18} />
                    <span>Add appeal evidence (optional)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      disabled={busy}
                      onChange={(event) =>
                        void uploadAppealEvidence(event.target.files?.[0])
                      }
                    />
                  </label>
                  {appealAttachments.length > 0 && (
                    <p className="evidence-count">
                      <FileCheck2 size={16} /> {appealAttachments.length} appeal
                      file{appealAttachments.length === 1 ? "" : "s"} ready
                    </p>
                  )}
                  <div>
                    <button
                      className="button button-primary compact"
                      disabled={busy}
                    >
                      Submit one appeal
                    </button>
                    <button
                      className="button button-secondary compact"
                      type="button"
                      onClick={() => {
                        setAppealId("");
                        setAppealReason("");
                        setAppealProofReference("");
                        setAppealAttachments([]);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

export function ModeratorClaimsPage() {
  const { status, user } = useAuth();
  const [pending, setPending] = useState<Claim[]>([]);
  const [reviewed, setReviewed] = useState<Claim[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<
    "" | "Approved" | "Rejected"
  >("");
  const [reviewerId, setReviewerId] = useState("");
  const [message, setMessage] = useState("");
  const canReview =
    user?.role === "Moderator" ||
    user?.role === "Admin" ||
    user?.capabilities?.includes("claims:review");

  const loadQueue = useCallback(
    async (
      filters: { status?: "Approved" | "Rejected"; reviewerId?: string } = {},
    ) => {
      try {
        const [queue, history] = await Promise.all([
          getPendingClaims(),
          getReviewedClaims(filters),
        ]);
        setPending(queue);
        setReviewed(history);
        setMessage("");
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Review queue could not be loaded.",
        );
      }
    },
    [],
  );

  useEffect(() => {
    if (status === "authenticated" && canReview) void loadQueue();
  }, [status, canReview, loadQueue]);

  if (status !== "authenticated") return <SignInPanel />;
  if (!canReview)
    return (
      <main className="auth-page page-shell">
        <section className="auth-panel">
          <Gavel />
          <h1>Moderator access required.</h1>
          <p>Your account needs the claims:review capability.</p>
        </section>
      </main>
    );

  async function decide(claim: Claim, decision: "Approved" | "Rejected") {
    if (claim.status !== "Pending") return;
    const reviewNotes = notes[claim.claimId]?.trim() ?? "";
    if (!reviewNotes) {
      setMessage("Add a moderation reason before recording a decision.");
      return;
    }
    try {
      const updated = await reviewClaim(claim.claimId, decision, reviewNotes);
      setPending((current) =>
        current.filter((item) => item.claimId !== claim.claimId),
      );
      setReviewed((current) => [updated, ...current]);
      setMessage(`Claim ${decision.toLowerCase()} and audit history updated.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review failed.");
      void loadQueue({
        status: statusFilter || undefined,
        reviewerId: reviewerId || undefined,
      });
    }
  }

  return (
    <main className="claims-page page-shell">
      <header className="claims-hero">
        <span className="eyebrow purple">
          <Gavel size={14} /> Moderator workspace
        </span>
        <h1>Review private evidence safely.</h1>
        <p>
          Decisions are recorded by the Claim Service. Refresh after conflicts
          rather than overriding a state transition.
        </p>
      </header>
      {message && (
        <p className="form-status" role="status">
          {message}
        </p>
      )}
      <section className="claim-panel moderation-section">
        <div className="claim-panel-heading">
          <ShieldCheck />
          <div>
            <h2>Pending queue</h2>
            <p>{pending.length} claims awaiting a decision</p>
          </div>
        </div>
        <div className="moderation-list">
          {pending.map((claim) => (
            <article className="moderation-card" key={claim.claimId}>
              <div className="moderation-meta">
                <StatusPill status={claim.status} />
                <span>{claim.type}</span>
                <span>{claim.tokenId}</span>
                <span>by {claim.userId}</span>
              </div>
              <p>{claim.description}</p>
              <details>
                <summary>Review private proof</summary>
                <pre>{JSON.stringify(claim.proofFields, null, 2)}</pre>
                <p>
                  {claim.attachments.length} scanned attachment reference(s)
                </p>
              </details>
              <label>
                Moderation reason
                <textarea
                  rows={3}
                  value={notes[claim.claimId] ?? ""}
                  onChange={(event) =>
                    setNotes((current) => ({
                      ...current,
                      [claim.claimId]: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="review-actions">
                <button
                  className="button button-primary compact"
                  type="button"
                  onClick={() => void decide(claim, "Approved")}
                >
                  Approve
                </button>
                <button
                  className="button button-danger compact"
                  type="button"
                  onClick={() => void decide(claim, "Rejected")}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
        {!pending.length && (
          <p className="claim-empty">The review queue is clear.</p>
        )}
      </section>
      <section className="claim-panel moderation-section">
        <div className="claim-panel-heading">
          <RotateCcw />
          <div>
            <h2>Reviewed audit history</h2>
            <p>Filter server-side review records.</p>
          </div>
        </div>
        <form
          className="audit-filters"
          onSubmit={(event) => {
            event.preventDefault();
            void loadQueue({
              status: statusFilter || undefined,
              reviewerId: reviewerId || undefined,
            });
          }}
        >
          <label>
            Status
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as typeof statusFilter)
              }
            >
              <option value="">All decisions</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </label>
          <label>
            Reviewer ID
            <input
              value={reviewerId}
              onChange={(event) => setReviewerId(event.target.value)}
              placeholder="Any reviewer"
            />
          </label>
          <button className="button button-secondary compact">
            Apply filters
          </button>
        </form>
        <div className="audit-list">
          {reviewed.map((claim) => (
            <article key={claim.claimId}>
              <StatusPill status={claim.status} />
              <strong>{claim.tokenId}</strong>
              <span>{claim.type}</span>
              <span>Reviewed {formatDate(claim.reviewedAt)}</span>
              <span>by {claim.reviewerId ?? "Moderator"}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function PublicClaimStatusPage() {
  const { claimId = "" } = useParams();
  const [claim, setClaim] = useState<PublicClaimStatus>();
  const [loadedClaimId, setLoadedClaimId] = useState("");
  const [message, setMessage] = useState(
    "Checking the public verification record…",
  );
  useEffect(() => {
    let active = true;
    setClaim(undefined);
    setLoadedClaimId("");
    setMessage("Checking the public verification record…");
    getPublicClaimStatus(claimId)
      .then((result) => {
        if (active) {
          setClaim(result);
          setLoadedClaimId(claimId);
          setMessage("");
        }
      })
      .catch((error: unknown) => {
        if (active)
          setMessage(
            error instanceof Error
              ? error.message
              : "Verification record unavailable.",
          );
      });
    return () => {
      active = false;
    };
  }, [claimId]);
  const currentClaim = loadedClaimId === claimId ? claim : undefined;
  return (
    <main className="public-claim-page page-shell">
      <section className="public-claim-card">
        <BadgeCheck
          className={currentClaim?.status === "Approved" ? "verified-icon" : ""}
          size={46}
        />
        <span className="eyebrow purple">Public verification</span>
        {currentClaim ? (
          <>
            <h1>
              {currentClaim.status === "Approved"
                ? "Verified project relationship"
                : "Claim status"}
            </h1>
            <StatusPill status={currentClaim.status} />
            <dl>
              <div>
                <dt>Claim type</dt>
                <dd>{currentClaim.type}</dd>
              </div>
              <div>
                <dt>Token</dt>
                <dd>{currentClaim.tokenId}</dd>
              </div>
              <div>
                <dt>Claimant</dt>
                <dd>{currentClaim.userId}</dd>
              </div>
              <div>
                <dt>Verified</dt>
                <dd>
                  {formatDate(
                    currentClaim.verifiedAt ?? currentClaim.reviewedAt,
                  )}
                </dd>
              </div>
            </dl>
            <p className="privacy-note">
              <LockKeyhole size={16} /> Evidence, reviewer identity, and
              moderation notes remain private.
            </p>
          </>
        ) : (
          <p role="status">{message}</p>
        )}
      </section>
    </main>
  );
}
