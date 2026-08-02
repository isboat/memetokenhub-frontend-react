import { Flame, Heart, MessageCircle, Star, ThumbsDown } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useAuth } from "../auth/authContext";
import {
  commentOnToken,
  followTarget,
  getTokenEngagement,
  getTokenSupporters,
  getTokenVote,
  likeToken,
  removeTokenVote,
  supportToken,
  type TokenEngagement,
  type TokenSupport,
  type TokenVote,
  unfollowTarget,
  voteOnToken,
  withdrawTokenSupport,
} from "../services/socialService";

export function TokenSocialPanel({ tokenId }: { tokenId: string }) {
  const { status, user, login } = useAuth();
  const [engagement, setEngagement] = useState<TokenEngagement>();
  const [vote, setVote] = useState<TokenVote>();
  const [supporters, setSupporters] = useState<TokenSupport[]>([]);
  const [comment, setComment] = useState("");
  const [statement, setStatement] = useState("");
  const [following, setFollowing] = useState(false);
  const [message, setMessage] = useState("");
  const isAuthenticated = status === "authenticated";
  const canSupport =
    user?.accountType === "KOL" ||
    user?.role === "Creator" ||
    user?.capabilities?.includes("social:support");
  async function refresh() {
    const [nextEngagement, nextVote, nextSupporters] = await Promise.all([
      getTokenEngagement(tokenId),
      getTokenVote(tokenId),
      getTokenSupporters(tokenId),
    ]);
    setEngagement(nextEngagement);
    setVote(nextVote);
    setSupporters(nextSupporters);
  }
  useEffect(() => {
    let active = true;
    Promise.all([
      getTokenEngagement(tokenId),
      getTokenVote(tokenId),
      getTokenSupporters(tokenId),
    ])
      .then(([nextEngagement, nextVote, nextSupporters]) => {
        if (active) {
          setEngagement(nextEngagement);
          setVote(nextVote);
          setSupporters(nextSupporters);
        }
      })
      .catch(() =>
        setMessage("Community activity is temporarily unavailable."),
      );
    return () => {
      active = false;
    };
  }, [tokenId]);
  function requireAuth(action: () => Promise<void>) {
    if (!isAuthenticated) {
      login();
      return;
    }
    action().catch((error: unknown) =>
      setMessage(
        error instanceof Error ? error.message : "Social action failed.",
      ),
    );
  }
  function cast(value: "Hot" | "NotHot") {
    requireAuth(async () => {
      setVote(await voteOnToken(tokenId, value));
      setMessage(`Your ${value} vote is recorded.`);
    });
  }
  async function submitComment(event: FormEvent) {
    event.preventDefault();
    requireAuth(async () => {
      await commentOnToken(tokenId, comment.trim());
      setComment("");
      await refresh();
      setMessage("Comment posted.");
    });
  }
  async function submitSupport(event: FormEvent) {
    event.preventDefault();
    requireAuth(async () => {
      await supportToken(tokenId, statement.trim());
      setStatement("");
      await refresh();
      setMessage("Support timestamp recorded.");
    });
  }
  return (
    <section className="social-panel">
      <div className="section-heading">
        <div>
          <div className="eyebrow purple">
            <MessageCircle size={14} /> Community signal
          </div>
          <h2>Join the conversation</h2>
          <p>
            Social Service is authoritative for follows, votes, support, likes,
            and comments.
          </p>
        </div>
      </div>
      {message && (
        <p className="form-status" role="status">
          {message}
        </p>
      )}
      <div className="social-action-row">
        <button
          type="button"
          className={following ? "active" : ""}
          onClick={() =>
            requireAuth(async () => {
              if (following) await unfollowTarget("Token", tokenId);
              else await followTarget("Token", tokenId);
              setFollowing(!following);
            })
          }
        >
          <Star /> {following ? "Following" : "Follow"}
        </button>
        <button
          type="button"
          onClick={() =>
            requireAuth(async () => {
              setEngagement(await likeToken(tokenId));
            })
          }
        >
          <Heart /> {engagement?.likes ?? 0} likes
        </button>
        <button
          type="button"
          className={vote?.viewerVote === "Hot" ? "active hot" : ""}
          onClick={() => cast("Hot")}
        >
          <Flame /> {vote?.hotVotes ?? 0} Hot
        </button>
        <button
          type="button"
          className={vote?.viewerVote === "NotHot" ? "active not-hot" : ""}
          onClick={() => cast("NotHot")}
        >
          <ThumbsDown /> {vote?.notHotVotes ?? 0} Not hot
        </button>
        {vote?.viewerVote && (
          <button
            type="button"
            onClick={() =>
              requireAuth(async () => {
                await removeTokenVote(tokenId);
                setVote(await getTokenVote(tokenId));
              })
            }
          >
            Remove vote
          </button>
        )}
      </div>
      <div className="social-grid">
        <form className="settings-card" onSubmit={submitComment}>
          <h3>Community comments</h3>
          <label>
            Add a comment
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={1000}
              required
            />
          </label>
          <button className="button button-secondary" type="submit">
            Post comment
          </button>
          <div className="comment-list">
            {engagement?.comments?.map((item) => (
              <article key={item.engagementId}>
                <p>{item.content}</p>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </article>
            ))}
          </div>
        </form>
        <div className="settings-card">
          <h3>Timestamped KOL support</h3>
          {canSupport && (
            <form onSubmit={submitSupport}>
              <label>
                Public support statement
                <textarea
                  value={statement}
                  onChange={(event) => setStatement(event.target.value)}
                  required
                />
              </label>
              <button className="button button-secondary" type="submit">
                Record support
              </button>
              <button
                className="text-link-button"
                type="button"
                onClick={() =>
                  requireAuth(async () => {
                    await withdrawTokenSupport(tokenId);
                    await refresh();
                  })
                }
              >
                Withdraw my support
              </button>
            </form>
          )}
          <div className="support-list">
            {supporters.map((item) => (
              <article key={item.supportId}>
                <strong>{item.kolUserId}</strong>
                <p>{item.statement}</p>
                <small>
                  Supported {new Date(item.createdAt).toLocaleString()}
                </small>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
