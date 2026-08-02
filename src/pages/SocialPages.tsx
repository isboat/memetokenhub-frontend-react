import {
  Activity as ActivityIcon,
  BadgeCheck,
  Newspaper,
  Users,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useAuth } from "../auth/authContext";
import {
  createPost,
  deletePost,
  getCollectorLeaderboard,
  getCreatorLeaderboard,
  getFeed,
  getMyFollows,
  getPosts,
  type Activity,
  type Follow,
  type PostAccess,
  type Reputation,
  type SocialPost,
  updatePost,
} from "../services/socialService";

export function CommunityNetworkPage() {
  const [creators, setCreators] = useState<Reputation[]>([]);
  const [collectors, setCollectors] = useState<Reputation[]>([]);
  const [message, setMessage] = useState("Loading reputation leaderboards…");
  useEffect(() => {
    Promise.all([getCreatorLeaderboard(12), getCollectorLeaderboard(12)])
      .then(([first, second]) => {
        setCreators(first);
        setCollectors(second);
        setMessage("");
      })
      .catch(() => setMessage("Live leaderboards are unavailable."));
  }, []);
  const board = (title: string, items: Reputation[]) => (
    <section>
      <h2>{title}</h2>
      <div className="reputation-list">
        {items.map((item, index) => (
          <article key={item.userId}>
            <span className="leader-rank">#{index + 1}</span>
            <span className="leader-avatar">👤</span>
            <div>
              <h3>
                {item.userId} <BadgeCheck size={14} />
              </h3>
              <p>{item.badges.join(" · ") || "Community member"}</p>
            </div>
            <strong>{item.score} pts</strong>
          </article>
        ))}
      </div>
    </section>
  );
  return (
    <main className="subpage page-shell">
      <div className="page-intro">
        <span className="eyebrow purple">
          <Users size={14} /> Reputation
        </span>
        <h1>
          Community
          <br />
          <span>leaderboards.</span>
        </h1>
        <p>
          Reputation reflects organic contributions, approved claims,
          publishing, and followers—never payment.
        </p>
      </div>
      {message && <p className="form-status">{message}</p>}
      <div className="leaderboard-grid">
        {board("Top creators", creators)}
        {board("Top collectors", collectors)}
      </div>
    </main>
  );
}

export function MySocialPage() {
  const { status, user, login } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [follows, setFollows] = useState<Follow[]>([]);
  const [filter, setFilter] = useState<
    "User" | "Token" | "Network" | undefined
  >();
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (status !== "authenticated" || !user) return;
    Promise.all([getFeed(user.userId, 30, 0), getMyFollows(filter, 30, 0)])
      .then(([feed, tracked]) => {
        setActivities(feed);
        setFollows(tracked);
      })
      .catch((error: unknown) =>
        setMessage(
          error instanceof Error ? error.message : "Social dashboard failed.",
        ),
      );
  }, [filter, status, user]);
  if (status !== "authenticated")
    return (
      <main className="auth-page page-shell">
        <section className="auth-panel">
          <ActivityIcon />
          <h1>Your social feed.</h1>
          <p>
            Connect to view tracked people, projects, networks, and personalized
            activity.
          </p>
          <button
            className="button button-primary"
            type="button"
            onClick={login}
          >
            Connect with Privy
          </button>
        </section>
      </main>
    );
  return (
    <main className="subpage page-shell">
      <div className="page-intro">
        <span className="eyebrow purple">
          <ActivityIcon size={14} /> My network
        </span>
        <h1>
          Your people.
          <br />
          <span>Your signal.</span>
        </h1>
      </div>
      {message && <p className="form-status">{message}</p>}
      <div className="social-dashboard">
        <section className="settings-card">
          <h2>Tracked targets</h2>
          <div className="network-filters">
            {([undefined, "User", "Token", "Network"] as const).map((item) => (
              <button
                className={filter === item ? "active" : ""}
                type="button"
                key={item ?? "All"}
                onClick={() => setFilter(item)}
              >
                {item ?? "All"}
              </button>
            ))}
          </div>
          {follows.map((item) => (
            <p key={`${item.targetType}-${item.targetId}`}>
              <strong>{item.targetType}</strong> {item.targetId}
            </p>
          ))}
        </section>
        <section className="settings-card">
          <h2>Personalized feed</h2>
          {activities.map((item) => (
            <article className="activity-item" key={item.activityId}>
              <strong>{item.type}</strong>
              <p>{item.description}</p>
              <small>{new Date(item.createdAt).toLocaleString()}</small>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

export function InsightsPage() {
  const { status, user, login } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [content, setContent] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [access, setAccess] = useState<PostAccess>("Public");
  const [editing, setEditing] = useState<string>();
  const [message, setMessage] = useState("Loading community insights…");
  const canPublish = Boolean(
    status === "authenticated" &&
    (user?.capabilities?.includes("social:posts:write") ||
      ["KOL", "Developer"].includes(user?.accountType ?? "") ||
      ["KOL", "Developer", "Creator", "Admin"].includes(user?.role ?? "")),
  );
  async function refresh() {
    setPosts(await getPosts({ limit: 30, offset: 0 }));
    setMessage("");
  }
  useEffect(() => {
    refresh().catch(() => setMessage("Insights are temporarily unavailable."));
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (status !== "authenticated") {
      login();
      return;
    }
    if (!canPublish) {
      setMessage(
        "Publishing is available to verified KOL and developer accounts.",
      );
      return;
    }
    try {
      if (editing)
        await updatePost(editing, { content, access, mediaUrls: [] });
      else
        await createPost({
          tokenId: tokenId || undefined,
          content,
          mediaUrls: [],
          access,
        });
      setContent("");
      setTokenId("");
      setEditing(undefined);
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Post failed.");
    }
  }
  return (
    <main className="subpage page-shell">
      <div className="page-intro">
        <span className="eyebrow purple">
          <Newspaper size={14} /> Insights
        </span>
        <h1>
          Ideas worth
          <br />
          <span>following.</span>
        </h1>
        <p>
          Public and subscriber-labelled content from KOLs and developers. Paid
          access never affects organic rank.
        </p>
      </div>
      {canPublish ? (
        <form className="settings-card post-composer" onSubmit={submit}>
          <h2>{editing ? "Edit insight" : "Publish an insight"}</h2>
          <label>
            Content
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={4000}
              required
            />
          </label>
          <div className="form-row">
            <label>
              Project ID (optional)
              <input
                value={tokenId}
                onChange={(event) => setTokenId(event.target.value)}
                disabled={Boolean(editing)}
              />
            </label>
            <label>
              Access
              <select
                value={access}
                onChange={(event) =>
                  setAccess(event.target.value as PostAccess)
                }
              >
                <option>Public</option>
                <option>Subscribers</option>
              </select>
            </label>
          </div>
          <button className="button button-primary" type="submit">
            {editing ? "Save changes" : "Publish"}
          </button>
        </form>
      ) : (
        <section className="settings-card post-composer">
          <h2>Publish an insight</h2>
          <p>
            {status === "authenticated"
              ? "Publishing is available to verified KOL and developer accounts."
              : "Connect your account to check whether you can publish insights."}
          </p>
          {status !== "authenticated" && (
            <button
              className="button button-primary"
              type="button"
              onClick={login}
            >
              Connect with Privy
            </button>
          )}
        </section>
      )}
      {message && <p className="form-status">{message}</p>}
      <div className="post-list">
        {posts.map((post) => (
          <article className="settings-card" key={post.postId}>
            <span className="leader-badge">
              {post.access}
              {post.moderationStatus ? ` · ${post.moderationStatus}` : ""}
            </span>
            <p>{post.content}</p>
            <small>{new Date(post.createdAt).toLocaleString()}</small>
            {post.authorId === user?.userId && (
              <div>
                <button
                  className="text-link-button"
                  type="button"
                  onClick={() => {
                    setEditing(post.postId);
                    setContent(post.content);
                    setAccess(post.access);
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-link-button"
                  type="button"
                  onClick={async () => {
                    await deletePost(post.postId);
                    await refresh();
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
