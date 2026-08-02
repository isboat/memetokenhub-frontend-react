import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  CheckCircle2,
  Flame,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/authContext";
import { communityLeaders, memeTokens } from "../data/mockData";
import { TokenCard } from "../components/TokenCard";
import {
  getToken,
  getTokenAnalytics,
  getTokenSentiment,
  type TokenAnalytics,
  type TokenProject,
  type TokenSentiment,
  type SentimentWindow,
} from "../services/tokenService";

export function CommunityPage() {
  return (
    <main className="subpage page-shell">
      <div className="page-intro">
        <span className="eyebrow purple">
          <Users size={14} /> Community
        </span>
        <h1>
          Meet the voices
          <br />
          <span>behind the culture.</span>
        </h1>
        <p>
          Follow trusted creators, curious collectors, and internet-native
          builders shaping what comes next.
        </p>
      </div>
      <div className="leader-grid expanded">
        {communityLeaders.map((leader) => (
          <article className="leader-card" key={leader.handle}>
            <span className="leader-avatar">{leader.avatar}</span>
            <div>
              <h3>
                {leader.name} <BadgeCheck size={16} />
              </h3>
              <p>{leader.handle}</p>
              <span className="leader-badge">{leader.badge}</span>
            </div>
            <div className="leader-followers">
              <strong>{leader.followers}</strong>
              <span>followers</span>
            </div>
            <Link
              className="leader-follow-button"
              to="/dashboard"
              aria-label={`Sign in to follow ${leader.name}`}
            >
              Follow
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

export function LearnPage() {
  return (
    <main className="subpage page-shell">
      <div className="page-intro">
        <span className="eyebrow green">
          <ShieldCheck size={14} /> Trust center
        </span>
        <h1>
          Hype is fun.
          <br />
          <span>Context is power.</span>
        </h1>
        <p>
          Learn how MemeTokenHub protects organic discovery and makes
          verification easy to understand.
        </p>
      </div>
      <div className="learning-grid">
        <article>
          <BadgeCheck />
          <h2>Identity verification</h2>
          <p>
            Badges show that project representatives and social identities
            completed evidence-based review. Private proof always stays private.
          </p>
        </article>
        <article>
          <Flame />
          <h2>Organic trends</h2>
          <p>
            Votes, support, and engagement create community direction.
            Sponsorship is always labelled and cannot purchase rank.
          </p>
        </article>
        <article>
          <CheckCircle2 />
          <h2>Clear provenance</h2>
          <p>
            Server timestamps preserve when endorsements and moderation
            decisions happened, so history stays honest.
          </p>
        </article>
      </div>
    </main>
  );
}

export function TokenDetailsPage() {
  const { tokenId } = useParams();
  const token = memeTokens.find((item) => item.id === tokenId) ?? memeTokens[0];
  const [project, setProject] = useState<TokenProject | null>(null);
  const [analytics, setAnalytics] = useState<TokenAnalytics | null>(null);
  const [sentiment, setSentiment] = useState<TokenSentiment | null>(null);
  const [sentimentWindow, setSentimentWindow] = useState<SentimentWindow>("7d");
  const [dataNotice, setDataNotice] = useState("Loading live project data…");
  useEffect(() => {
    if (!tokenId) return;
    let active = true;
    getToken(tokenId)
      .then((detail) => {
        if (active) {
          setProject(detail);
          setDataNotice("Live canonical project data.");
        }
      })
      .catch(() => {
        if (active)
          setDataNotice("Project API unavailable; showing preview data.");
      });
    return () => {
      active = false;
    };
  }, [tokenId]);
  useEffect(() => {
    if (!tokenId) return;
    let active = true;
    getTokenAnalytics(tokenId)
      .then((stats) => {
        if (active) setAnalytics(stats);
      })
      .catch(() => {
        if (active) setAnalytics(null);
      });
    return () => {
      active = false;
    };
  }, [tokenId]);
  useEffect(() => {
    if (!tokenId) return;
    let active = true;
    getTokenSentiment(tokenId, sentimentWindow)
      .then((vibe) => {
        if (active) setSentiment(vibe);
      })
      .catch(() => {
        if (active) setSentiment(null);
      });
    return () => {
      active = false;
    };
  }, [sentimentWindow, tokenId]);
  return (
    <main className="subpage page-shell">
      <Link className="back-link" to="/">
        <ArrowLeft size={16} /> Back to discover
      </Link>
      <div className="details-hero">
        <div
          className="detail-mascot"
          style={{
            background: `linear-gradient(145deg, ${token.colors[0]}, ${token.colors[1]})`,
          }}
        >
          {project?.logoUrl ? (
            <img src={project.logoUrl} alt="" />
          ) : (
            token.mascot
          )}
        </div>
        <div>
          <span className="eyebrow purple">
            <BadgeCheck size={14} />{" "}
            {project?.launchStatus ?? "Preview project"}
          </span>
          <h1>
            {project?.name ?? token.name}{" "}
            <span>${project?.symbol ?? token.symbol}</span>
          </h1>
          <p>
            {project?.description ?? token.description} Join{" "}
            {project?.community?.followersCount ?? token.supporters} community
            members following the story.
          </p>
          <div className="hero-actions">
            <button className="button button-primary" type="button">
              Follow project
            </button>
            <button className="button button-secondary" type="button">
              Vote hot 🔥
            </button>
          </div>
        </div>
      </div>
      <p className="data-source-note">{dataNotice}</p>
      <div className="detail-stats">
        <article>
          <span>Live price</span>
          <strong>
            {analytics?.price !== undefined
              ? `$${analytics.price.toLocaleString()}`
              : token.price}
          </strong>
          <em className={token.change >= 0 ? "positive" : "negative"}>
            {token.change}% today
          </em>
        </article>
        <article>
          <span>Market cap</span>
          <strong>
            {analytics?.marketCap !== undefined
              ? `$${analytics.marketCap.toLocaleString()}`
              : token.marketCap}
          </strong>
          <em>{project?.network ?? token.network}</em>
        </article>
        <article>
          <span>Community vibe</span>
          <strong>{sentiment?.sentimentScore ?? token.sentiment}% hot</strong>
          <em>Organic sentiment</em>
        </article>
      </div>
      <div className="sentiment-window" aria-label="Sentiment time window">
        {(["24h", "7d", "30d", "all"] as const).map((item) => (
          <button
            className={sentimentWindow === item ? "active" : ""}
            type="button"
            key={item}
            onClick={() => setSentimentWindow(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <section className="related">
        <h2>More from the hub</h2>
        <div className="token-grid">
          {memeTokens
            .filter((item) => item.id !== token.id)
            .slice(0, 3)
            .map((item) => (
              <TokenCard key={item.id} token={item} />
            ))}
        </div>
      </section>
    </main>
  );
}

export function DashboardPage() {
  const { status, user, errorMessage, login, logout, retryExchange } =
    useAuth();

  if (status !== "authenticated") {
    return (
      <main className="auth-page page-shell">
        <section className="auth-panel">
          <span className="auth-panel-icon">
            <ShieldCheck />
          </span>
          <div className="eyebrow purple">Protected experience</div>
          <h1>
            {status === "not-configured"
              ? "Connect your Privy app."
              : "Join the hub."}
          </h1>
          <p>
            {status === "not-configured"
              ? "Set VITE_PRIVY_APP_ID and VITE_API_BASE_URL to enable the documented Privy token exchange."
              : status === "error"
                ? errorMessage
                : status === "exchanging" || status === "loading"
                  ? "Verifying your Privy session and creating a secure MemeTokenHub session…"
                  : "Sign in with email or a wallet. MemeTokenHub exchanges your Privy token for a secure platform session."}
          </p>
          {status === "anonymous" && (
            <button
              className="button button-primary"
              type="button"
              onClick={login}
            >
              Connect with Privy
            </button>
          )}
          {status === "error" && (
            <div className="hero-actions">
              <button
                className="button button-primary"
                type="button"
                onClick={retryExchange}
              >
                Try exchange again
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => void logout()}
              >
                Sign out
              </button>
            </div>
          )}
          {status === "not-configured" && (
            <Link className="button button-secondary" to="/learn">
              View trust center
            </Link>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="subpage page-shell dashboard">
      <div className="page-intro">
        <span className="eyebrow purple">
          <LayoutDashboard size={14} /> Demo dashboard
        </span>
        <h1>
          Your corner of
          <br />
          <span>meme culture.</span>
        </h1>
        <p>
          Welcome back{user?.username ? `, ${user.username}` : ""}. Your Privy
          identity is connected to a MemeTokenHub platform session.
        </p>
      </div>
      <div className="dashboard-grid">
        <article>
          <Bell />
          <div>
            <span>Notifications</span>
            <strong>3 new signals</strong>
            <p>PEPE sentiment is moving and two creators posted.</p>
          </div>
        </article>
        <article>
          <Flame />
          <div>
            <span>Tracked projects</span>
            <strong>12 communities</strong>
            <p>Your watchlist is up 8.4% in community activity.</p>
          </div>
        </article>
        <article>
          <Sparkles />
          <div>
            <span>Profile strength</span>
            <strong>75% complete</strong>
            <p>Verify a social channel to earn your first badge.</p>
          </div>
        </article>
      </div>
    </main>
  );
}

export function NotFoundPage() {
  return (
    <main className="not-found page-shell">
      <span>404</span>
      <h1>This meme got rugged.</h1>
      <p>The page you followed is no longer in the block.</p>
      <Link className="button button-primary" to="/">
        Return to discover
      </Link>
    </main>
  );
}
