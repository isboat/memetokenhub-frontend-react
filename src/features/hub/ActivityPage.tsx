import { useEffect, useState } from "react";
import { HubLayout, ExternalLink } from "./HubLayout";
import { gatewayRequest } from "../../services/gatewayClient";
import { hubConnected, utcDate } from "./api";
interface SocialChange {
  id: string;
  name: string;
  network: string;
  contractAddress: string;
  source: string;
  sourceUrl: string;
  observedAt: string;
  previousLinks: string[];
  currentLinks: string[];
}
export function ActivityPage() {
  const [items, setItems] = useState<SocialChange[]>([]);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(hubConnected);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!hubConnected) return;
    let active = true;
    setLoading(true);
    setError("");
    gatewayRequest("/api/hub/activity")
      .then(async (r) => {
        if (!r.ok)
          throw new Error("Social update activity could not be loaded.");
        return r.json() as Promise<SocialChange[]>;
      })
      .then((rows) => {
        if (active) setItems(rows);
      })
      .catch((e: unknown) => {
        if (active)
          setError(e instanceof Error ? e.message : "Activity unavailable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  const visible = items.filter(
    (x) =>
      (source === "All" || x.source === source) &&
      `${x.name} ${x.network} ${x.contractAddress}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <HubLayout
      title="What changed around the Hub?"
      description="A source-attributed record of token social-link changes observed on DEX Screener and DEXTools. A social update is not a verification signal."
    >
      <div className="hub-toolbar">
        <label className="hub-search">
          <span className="sr-only">Search activity</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a token, network or contract…"
          />
        </label>
        <label>
          <span className="sr-only">Activity source</span>
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option>All</option>
            <option>DEX Screener</option>
            <option>DEXTools</option>
          </select>
        </label>
        <button
          className="button button-secondary"
          onClick={() => setRevision((x) => x + 1)}
          disabled={loading}
        >
          Refresh
        </button>
      </div>
      <p className="hub-notice">
        The feed records changes between observed snapshots, not a platform’s
        original update time. First observations establish a baseline and are
        not presented as social updates. DEXTools activity is not connected yet.
      </p>
      {loading && <p role="status">Loading social changes…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && !visible.length && (
        <section className="hub-card hub-empty">
          <h2>No observed social changes yet.</h2>
          <p>
            {hubConnected
              ? "Changes will appear after collection has established a baseline and observed a subsequent change."
              : "Live activity is not connected in this preview. No sample updates are presented as live."}
          </p>
        </section>
      )}
      <div className="hub-grid">
        {visible.map((item) => (
          <article key={item.id} className="hub-card">
            <span className="hub-tag">{item.source}</span>
            <h2>{item.name}</h2>
            <p>
              {item.network} · {utcDate(item.observedAt)}
            </p>
            <p className="hub-address">{item.contractAddress}</p>
            <h3>Previous social links</h3>
            {item.previousLinks.map((url) => (
              <div key={url}>
                <ExternalLink url={url}>{url}</ExternalLink>
              </div>
            ))}
            <h3>Current social links</h3>
            {item.currentLinks.map((url) => (
              <div key={url}>
                <ExternalLink url={url}>{url}</ExternalLink>
              </div>
            ))}
            <ExternalLink url={item.sourceUrl}>View source</ExternalLink>
          </article>
        ))}
      </div>
    </HubLayout>
  );
}
