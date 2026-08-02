import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Compass,
  Flame,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TokenCard } from "../components/TokenCard";
import { communityLeaders, memeTokens, networks } from "../data/mockData";
import {
  getNetworks,
  getTokenFeed,
  type TokenProject,
} from "../services/tokenService";
import type { MemeToken } from "../types";

function projectToCard(project: TokenProject): MemeToken {
  const sentiment = project.community?.sentimentScore ?? 0;
  return {
    id: project.tokenId,
    name: project.name,
    symbol: project.symbol,
    description: project.description,
    network: project.network,
    price:
      project.metadata?.price !== undefined
        ? `$${project.metadata.price.toLocaleString()}`
        : "—",
    change: 0,
    marketCap:
      project.metadata?.marketCap !== undefined
        ? `$${project.metadata.marketCap.toLocaleString()}`
        : "—",
    supporters: String(project.community?.supportersCount ?? 0),
    sentiment,
    status:
      project.status === "Featured"
        ? "Trending"
        : project.launchStatus === "Published"
          ? "Verified"
          : "New",
    colors: ["#5271ff", "#20d9c2"],
    mascot: "🪙",
  };
}

export function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const [tokens, setTokens] = useState<MemeToken[]>(memeTokens);
  const [networkOptions, setNetworkOptions] = useState(networks);
  const [feedNotice, setFeedNotice] = useState(
    "Showing preview data while live discovery connects.",
  );
  useEffect(() => {
    let active = true;
    Promise.all([getTokenFeed("trending", 12), getNetworks()])
      .then(([projects, supported]) => {
        if (active) {
          setTokens(projects.map(projectToCard));
          setNetworkOptions([
            "All networks",
            ...supported.map((item) => item.network),
          ]);
          setFeedNotice("Live Token Service discovery.");
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  const visibleTokens = useMemo(
    () =>
      tokens.filter((token) => {
        const matchesSearch = `${token.name} ${token.symbol}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return (
          matchesSearch &&
          (selectedNetwork === "All networks" ||
            token.network === selectedNetwork)
        );
      }),
    [searchTerm, selectedNetwork, tokens],
  );

  return (
    <>
      <main>
        <section className="hero page-shell">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" /> The culture is moving
            </div>
            <h1>
              The meme market,
              <br />
              <span>made social.</span>
            </h1>
            <p>
              Track fast-moving projects, verified creators, and real community
              sentiment—all from one trusted crypto-native hub.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#trending">
                <Compass size={18} /> Start exploring
              </a>
              <Link className="button button-secondary" to="/community">
                <Users size={18} /> Meet the community
              </Link>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack">
                <span>🐸</span>
                <span>🐕</span>
                <span>😼</span>
                <span>🦊</span>
              </div>
              <p>
                <strong>42,000+ community members</strong>
                <br />
                tracking the culture together
              </p>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-coin coin-main">
              <span>🐸</span>
              <strong>PEPE</strong>
              <small>+18.4%</small>
            </div>
            <div className="hero-coin coin-small coin-dog">🐕</div>
            <div className="hero-coin coin-small coin-cat">😹</div>
            <div className="floating-stat stat-top">
              <TrendingUp size={17} />
              <span>
                <strong>98%</strong> community vibe
              </span>
            </div>
            <div className="floating-stat stat-bottom">
              <Flame size={17} />
              <span>
                <strong>#1 trending</strong> right now
              </span>
            </div>
            <span className="spark spark-one">✦</span>
            <span className="spark spark-two">✦</span>
            <span className="spark spark-three">●</span>
          </div>
        </section>

        <section className="ticker" aria-label="Market highlights">
          <div className="ticker-track">
            {tokens.slice(0, 5).map((token) => (
              <div key={token.id}>
                <span>{token.mascot}</span>
                <strong>${token.symbol}</strong>
                <span className={token.change >= 0 ? "positive" : "negative"}>
                  {token.change >= 0 ? "↗" : "↘"} {Math.abs(token.change)}%
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="section page-shell" id="trending">
          <div className="section-heading">
            <div>
              <div className="eyebrow purple">
                <Flame size={14} /> Hot right now
              </div>
              <h2>Trending projects</h2>
              <p>What the community can't stop talking about.</p>
            </div>
            <Link className="text-link desktop-only" to="/community">
              View all projects <ArrowRight size={17} />
            </Link>
          </div>
          <div className="filter-toolbar">
            <label className="search-field">
              <Search size={18} />
              <span className="sr-only">Search projects</span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search projects or symbols"
              />
            </label>
            <div className="network-filters" aria-label="Filter by network">
              {networkOptions.map((network) => (
                <button
                  className={network === selectedNetwork ? "active" : ""}
                  key={network}
                  type="button"
                  onClick={() => setSelectedNetwork(network)}
                >
                  {network}
                </button>
              ))}
            </div>
          </div>
          <p className="data-source-note">{feedNotice}</p>
          {visibleTokens.length > 0 ? (
            <div className="token-grid">
              {visibleTokens.map((token) => (
                <TokenCard key={token.id} token={token} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              No projects match that search. Try another vibe.
            </div>
          )}
        </section>

        <section className="trust-section">
          <div className="page-shell trust-grid">
            <div className="trust-copy">
              <div className="eyebrow green">
                <ShieldCheck size={14} /> Built on trust
              </div>
              <h2>
                Signal over noise.
                <br />
                <span>Always.</span>
              </h2>
              <p>
                Meme culture moves fast. We help you see the people, provenance,
                and community direction behind every project.
              </p>
              <Link className="button button-dark" to="/learn">
                How verification works <ArrowRight size={17} />
              </Link>
            </div>
            <div className="feature-grid">
              <article>
                <span className="feature-icon green-icon">
                  <BadgeCheck />
                </span>
                <h3>Verified identities</h3>
                <p>Know when a project or creator has proven who they are.</p>
              </article>
              <article>
                <span className="feature-icon purple-icon">
                  <BarChart3 />
                </span>
                <h3>Organic signals</h3>
                <p>Community sentiment stays separate from paid promotion.</p>
              </article>
              <article>
                <span className="feature-icon orange-icon">
                  <Flame />
                </span>
                <h3>Timestamped support</h3>
                <p>See exactly when trusted voices backed a project.</p>
              </article>
              <article>
                <span className="feature-icon blue-icon">
                  <Sparkles />
                </span>
                <h3>Real community</h3>
                <p>Follow people and projects—not manufactured hype.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section page-shell leaders-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow purple">
                <Users size={14} /> People to know
              </div>
              <h2>Community voices</h2>
              <p>Track the tastemakers moving meme culture forward.</p>
            </div>
            <Link className="text-link desktop-only" to="/community">
              Explore community <ArrowRight size={17} />
            </Link>
          </div>
          <div className="leader-grid">
            {communityLeaders.map((leader, index) => (
              <article className="leader-card" key={leader.handle}>
                <span className="leader-rank">0{index + 1}</span>
                <span className="leader-avatar">{leader.avatar}</span>
                <div>
                  <h3>
                    {leader.name} {leader.verified && <BadgeCheck size={16} />}
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
        </section>

        <section className="cta-section page-shell">
          <div className="cta-card">
            <span className="cta-decoration">✦</span>
            <div>
              <div className="eyebrow light">
                <Sparkles size={14} /> Your feed. Your culture.
              </div>
              <h2>
                Don't just watch
                <br />
                the memes happen.
              </h2>
              <p>
                Join thousands discovering projects early, backing communities,
                and building the next chapter of internet culture.
              </p>
              <Link className="button button-light" to="/dashboard">
                Create your profile <ArrowRight size={17} />
              </Link>
            </div>
            <div className="cta-mascots" aria-hidden="true">
              <span>🐸</span>
              <span>😼</span>
              <span>🐕</span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
