import {
  BadgeDollarSign,
  CreditCard,
  ExternalLink,
  LockKeyhole,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/authContext";
import {
  cancelSubscription,
  type CheckoutSession,
  type CreatorEarningsSummary,
  type Entitlement,
  getMyCreatorEarnings,
  getMyEntitlements,
  getPaymentHistory,
  type Payment,
  type PaymentPurpose,
  startCreatorCheckout,
  startTokenCheckout,
} from "../services/paymentService";

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function date(value?: string) {
  return value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "—";
}

function PaymentSignIn() {
  const { errorMessage, login, logout, retryExchange, status } = useAuth();
  const busy = status === "loading" || status === "exchanging";
  return (
    <main className="auth-page page-shell">
      <section className="auth-panel">
        <LockKeyhole />
        <h1>
          {busy
            ? "Securing checkout…"
            : status === "error"
              ? "Your Privy login succeeded."
              : "Connect to manage payments."}
        </h1>
        <p>
          {status === "error"
            ? (errorMessage ?? "The MemeTokenHub token exchange failed.")
            : "Payment history and entitlements are tied to your verified account."}
        </p>
        {status === "anonymous" && (
          <button className="button button-primary" onClick={login}>
            Connect with Privy
          </button>
        )}
        {busy && (
          <button className="button button-primary" disabled>
            Connecting…
          </button>
        )}
        {status === "error" && (
          <div className="review-actions">
            <button className="button button-primary" onClick={retryExchange}>
              Retry exchange
            </button>
            <button
              className="button button-secondary"
              onClick={() => void logout()}
            >
              Sign out
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function CheckoutDisclosure({ session }: { session: CheckoutSession }) {
  return (
    <aside
      className="checkout-disclosure"
      aria-label="Server-confirmed checkout offer"
    >
      <div>
        <span>Total</span>
        <strong>{money(session.amount, session.currency)}</strong>
      </div>
      {session.platformFee !== undefined && (
        <div>
          <span>Platform fee</span>
          <strong>{money(session.platformFee, session.currency)}</strong>
        </div>
      )}
      {session.creatorAmount !== undefined && (
        <div>
          <span>Creator receives</span>
          <strong>{money(session.creatorAmount, session.currency)}</strong>
        </div>
      )}
      {session.renewalTerms && (
        <p>
          <RefreshCcw size={15} /> {session.renewalTerms}
        </p>
      )}
      <a
        className="button button-primary"
        href={session.checkoutUrl}
        rel="noopener noreferrer"
      >
        Continue to secure checkout <ExternalLink size={16} />
      </a>
      <small>
        Access is granted only after the Payment Service verifies the provider
        webhook—not when you return from checkout.
      </small>
    </aside>
  );
}

export function PaymentsPage() {
  const { status, user } = useAuth();
  const [history, setHistory] = useState<Payment[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [checkout, setCheckout] = useState<CheckoutSession>();
  const [tokenId, setTokenId] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [postId, setPostId] = useState("");
  const [purpose, setPurpose] = useState<
    Exclude<PaymentPurpose, "TokenPurchase">
  >("CreatorSubscription");
  const [amount, setAmount] = useState("5");
  const [currency, setCurrency] = useState("USD");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && user)
      Promise.all([getPaymentHistory(user.userId), getMyEntitlements()])
        .then(([payments, access]) => {
          setHistory(payments);
          setEntitlements(access);
        })
        .catch((error: unknown) =>
          setMessage(
            error instanceof Error
              ? error.message
              : "Payments could not be loaded.",
          ),
        );
  }, [status, user]);

  if (status !== "authenticated" || !user) return <PaymentSignIn />;
  const authenticatedUserId = user.userId;

  async function createTokenCheckout(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setCheckout(undefined);
    setMessage("Resolving the server-owned token offer…");
    try {
      const session = await startTokenCheckout({
        userId: authenticatedUserId,
        tokenId,
        amount: Number(amount),
      });
      setCheckout(session);
      setMessage(
        "Review the confirmed price and fee disclosure before continuing.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Checkout could not start.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function createCreatorCheckout(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setCheckout(undefined);
    setMessage("Resolving the creator offer…");
    try {
      const session = await startCreatorCheckout({
        creatorId,
        purpose,
        postId: purpose === "PremiumPost" ? postId : undefined,
        amount: Number(amount),
        currency,
      });
      setCheckout(session);
      setMessage("Review the server-confirmed terms before continuing.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Checkout could not start.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function cancel(entitlement: Entitlement) {
    if (!entitlement.subscriptionId) return;
    setBusy(true);
    try {
      await cancelSubscription(entitlement.subscriptionId);
      setEntitlements((current) =>
        current.map((item) =>
          item.entitlementId === entitlement.entitlementId
            ? { ...item, renews: false, status: "Cancelled" }
            : item,
        ),
      );
      setMessage(
        "Renewal cancelled. Paid access remains available through its expiry.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Cancellation failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="money-page page-shell">
      <header className="money-hero">
        <span className="eyebrow green">
          <ShieldCheck size={14} /> Secure payments
        </span>
        <h1>Support creators transparently.</h1>
        <p>
          Subscribe, tip, unlock premium posts, or start a token checkout
          without affecting rankings, sentiment, or verification.
        </p>
      </header>
      {message && (
        <p className="form-status" role="status">
          {message}
        </p>
      )}
      <div className="money-layout">
        <section className="money-panel">
          <div className="money-heading">
            <CreditCard />
            <div>
              <h2>Creator checkout</h2>
              <p>Server pricing and fees override all client-entered values.</p>
            </div>
          </div>
          <form className="money-form" onSubmit={createCreatorCheckout}>
            <label>
              Creator ID
              <input
                required
                value={creatorId}
                onChange={(event) => setCreatorId(event.target.value)}
              />
            </label>
            <label>
              Purpose
              <select
                value={purpose}
                onChange={(event) =>
                  setPurpose(event.target.value as typeof purpose)
                }
              >
                <option value="CreatorSubscription">
                  Creator subscription
                </option>
                <option value="Tip">One-time tip</option>
                <option value="PremiumPost">Premium post</option>
              </select>
            </label>
            {purpose === "PremiumPost" && (
              <label>
                Post ID
                <input
                  required
                  value={postId}
                  onChange={(event) => setPostId(event.target.value)}
                />
              </label>
            )}
            <div className="money-fields">
              <label>
                Displayed amount
                <input
                  min="0.01"
                  step="0.01"
                  type="number"
                  required
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </label>
              <label>
                Currency
                <input
                  maxLength={3}
                  required
                  value={currency}
                  onChange={(event) =>
                    setCurrency(event.target.value.toUpperCase())
                  }
                />
              </label>
            </div>
            <button className="button button-primary" disabled={busy}>
              Review creator offer
            </button>
          </form>
        </section>
        <section className="money-panel">
          <div className="money-heading">
            <WalletCards />
            <div>
              <h2>Token checkout</h2>
              <p>Project and amount are validated again by the server.</p>
            </div>
          </div>
          <form className="money-form" onSubmit={createTokenCheckout}>
            <label>
              Token ID
              <input
                required
                value={tokenId}
                onChange={(event) => setTokenId(event.target.value)}
              />
            </label>
            <label>
              Displayed amount
              <input
                min="0.01"
                step="0.01"
                type="number"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </label>
            <button className="button button-secondary" disabled={busy}>
              Review token offer
            </button>
          </form>
        </section>
      </div>
      {checkout && <CheckoutDisclosure session={checkout} />}
      <section className="money-panel money-section">
        <div className="money-heading">
          <BadgeDollarSign />
          <div>
            <h2>Your access</h2>
            <p>Only webhook-confirmed entitlements appear here.</p>
          </div>
        </div>
        <div className="entitlement-grid">
          {entitlements.map((item) => (
            <article key={item.entitlementId}>
              <span className={`payment-state ${item.status.toLowerCase()}`}>
                {item.status}
              </span>
              <h3>
                {item.purpose === "CreatorSubscription"
                  ? "Creator subscription"
                  : "Premium post"}
              </h3>
              <p>Creator {item.creatorId}</p>
              <dl>
                <div>
                  <dt>Access through</dt>
                  <dd>{date(item.expiresAt)}</dd>
                </div>
                <div>
                  <dt>Renewal</dt>
                  <dd>{item.renews ? "Enabled" : "Off"}</dd>
                </div>
              </dl>
              {item.subscriptionId && item.renews && (
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={() => void cancel(item)}
                >
                  Cancel renewal
                </button>
              )}
            </article>
          ))}
        </div>
        {!entitlements.length && (
          <p className="claim-empty">
            No active subscriptions or premium-post purchases.
          </p>
        )}
      </section>
      <section className="money-panel money-section">
        <div className="money-heading">
          <ReceiptText />
          <div>
            <h2>Payment history</h2>
            <p>Receipts reflect provider-confirmed transactions.</p>
          </div>
        </div>
        <div className="payment-table">
          {history.map((payment) => (
            <article key={payment.paymentId}>
              <span className={`payment-state ${payment.status.toLowerCase()}`}>
                {payment.status}
              </span>
              <div>
                <strong>{payment.purpose}</strong>
                <small>{date(payment.createdAt)}</small>
              </div>
              <strong>{money(payment.amount, payment.currency)}</strong>
              {payment.receiptUrl ? (
                <a href={payment.receiptUrl} rel="noopener noreferrer">
                  Receipt <ExternalLink size={14} />
                </a>
              ) : (
                <span>Receipt pending</span>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function CreatorEarningsPage() {
  const { status, user } = useAuth();
  const [summary, setSummary] = useState<CreatorEarningsSummary>();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const canView =
    ["KOL", "Creator", "Admin"].includes(user?.role ?? "") ||
    user?.capabilities?.includes("payments:earnings");
  const load = useCallback(
    async (filters: { from?: string; to?: string } = {}) => {
      try {
        setSummary(await getMyCreatorEarnings(filters));
        setMessage("");
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Earnings could not be loaded.",
        );
      }
    },
    [],
  );
  useEffect(() => {
    if (status === "authenticated" && canView) void load();
  }, [status, canView, load]);
  if (status !== "authenticated") return <PaymentSignIn />;
  if (!canView)
    return (
      <main className="auth-page page-shell">
        <section className="auth-panel">
          <LockKeyhole />
          <h1>Creator access required.</h1>
          <p>Earnings are private to the authenticated creator.</p>
        </section>
      </main>
    );
  return (
    <main className="money-page page-shell">
      <header className="money-hero">
        <span className="eyebrow green">
          <BadgeDollarSign size={14} /> Creator ledger
        </span>
        <h1>Understand every payout.</h1>
        <p>
          Gross revenue, transparent fees, and net creator earnings come from
          the immutable payment ledger.
        </p>
      </header>
      <form
        className="earnings-filters"
        onSubmit={(event) => {
          event.preventDefault();
          void load({ from: from || undefined, to: to || undefined });
        }}
      >
        <label>
          From
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </label>
        <button className="button button-secondary">Apply dates</button>
      </form>
      {message && <p className="form-status">{message}</p>}
      {summary && (
        <>
          <div className="earnings-summary">
            <article>
              <span>Gross</span>
              <strong>{money(summary.grossAmount, summary.currency)}</strong>
            </article>
            <article>
              <span>Platform fees</span>
              <strong>{money(summary.platformFees, summary.currency)}</strong>
            </article>
            <article>
              <span>Net earnings</span>
              <strong>{money(summary.netAmount, summary.currency)}</strong>
            </article>
          </div>
          <section className="money-panel money-section">
            <div className="payment-table">
              {summary.transactions.map((payment) => (
                <article key={payment.paymentId}>
                  <span
                    className={`payment-state ${payment.status.toLowerCase()}`}
                  >
                    {payment.status}
                  </span>
                  <div>
                    <strong>{payment.purpose}</strong>
                    <small>
                      {date(payment.completedAt ?? payment.createdAt)}
                    </small>
                  </div>
                  <strong>
                    {money(
                      payment.creatorAmount ?? payment.amount,
                      payment.currency,
                    )}
                  </strong>
                  <span>{payment.paymentId}</span>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
