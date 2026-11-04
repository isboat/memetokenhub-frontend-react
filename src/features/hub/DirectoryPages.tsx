import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useAuth } from "../../auth/authContext";
import {
  exchangeDirectory,
  launchpadDirectory,
  networkDirectory,
  type DirectoryItem,
} from "./catalog";
import { hubConnected, saveHub, type ListingApplication } from "./api";
import { ExternalLink, HubLayout } from "./HubLayout";
function ApplicationForm({
  category,
}: {
  category: ListingApplication["category"];
}) {
  const { status, login } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    setBusy(true);
    setMessage("");
    try {
      await saveHub("applications", {
        category,
        name: String(d.get("name")),
        websiteUrl: String(d.get("websiteUrl")),
        story: String(d.get("story")),
        contactEmail: String(d.get("email")),
      });
      setMessage(
        hubConnected
          ? "Application received for review. This does not create an approved listing."
          : "Local draft saved in this browser. It has not been sent to MTH.",
      );
      form.reset();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save the application.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="hub-card hub-application" id="apply">
      <span className="eyebrow purple">GROW THE DIRECTORY</span>
      <h2>Missing a {category}?</h2>
      <p>
        Tell us its story. Include its official website, origins, ecosystem and
        relevant disclosures. Applications require review before appearing in
        the directory.
      </p>
      {hubConnected && status !== "authenticated" ? (
        <button className="button button-primary" onClick={login}>
          Sign in to apply
        </button>
      ) : (
        <form onSubmit={submit} className="hub-form">
          <label>
            Name
            <input name="name" required maxLength={100} />
          </label>
          <label>
            Official website
            <input
              name="websiteUrl"
              type="url"
              pattern="https://.*"
              placeholder="https://"
              required
              maxLength={1000}
            />
          </label>
          <label>
            Contact email
            <input name="email" type="email" required maxLength={200} />
          </label>
          <label className="hub-wide">
            History, lore and details
            <textarea name="story" rows={5} required maxLength={4000} />
          </label>
          <label className="hub-wide hub-check">
            <input type="checkbox" required />I am authorized to supply this
            information and understand that a listing is not an endorsement.
          </label>
          <button disabled={busy} className="button button-primary">
            {busy
              ? "Saving…"
              : hubConnected
                ? "Apply for review"
                : "Save local application draft"}
          </button>
        </form>
      )}
      <p role="status">{message}</p>
    </section>
  );
}
function DirectoryPage({
  title,
  description,
  items,
  category,
}: {
  title: string;
  description: string;
  items: DirectoryItem[];
  category: ListingApplication["category"];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const categories = [...new Set(items.map((x) => x.category))];
  const visible = items.filter(
    (x) =>
      (filter === "All" || x.category === filter) &&
      `${x.name} ${x.description} ${x.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <HubLayout
      title={title}
      description={description}
      action={
        <a className="button button-primary" href="#apply">
          Apply to list
        </a>
      }
    >
      <div className="hub-toolbar">
        <label className="hub-search">
          <Search size={18} />
          <span className="sr-only">Search directory</span>
          <input
            placeholder="Search names, stories or ecosystems…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Directory category</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            {categories.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <span aria-live="polite">
          {visible.length} of {items.length} entries
        </span>
      </div>
      <p className="hub-muted">
        Editorial reference directory, not a recommendation or confirmation of
        current availability. Follow official sources for current status, fees
        and network identifiers. Names may refer to related but distinct
        ecosystems.
      </p>
      <div className="hub-grid">
        {visible.map((x) => (
          <article className="hub-card" key={x.name}>
            <span className="hub-tag">{x.category}</span>
            <h2>{x.name}</h2>
            <p>{x.description}</p>
            <ExternalLink url={x.url}>Official website</ExternalLink>
            {!x.url && (
              <span className="hub-muted">
                Official identity awaiting confirmation
              </span>
            )}
          </article>
        ))}
      </div>
      {visible.length === 0 && (
        <p className="hub-empty">
          No entries match. Try another name or clear the filters.
        </p>
      )}
      <ApplicationForm category={category} />
    </HubLayout>
  );
}
export function NetworksPage() {
  return (
    <DirectoryPage
      title="Every chain has a story."
      description="Explore the technology, communities and origin stories behind the networks. Missing yours? Share its lore."
      items={networkDirectory}
      category="network"
    />
  );
}
export function LaunchpadsPage() {
  return (
    <DirectoryPage
      title="Where the countdown begins."
      description="A directory of independent token launch platforms. Understand the venue before joining the launch."
      items={launchpadDirectory}
      category="launchpad"
    />
  );
}
export function ExchangesPage() {
  return (
    <DirectoryPage
      title="Know the venue."
      description="Explore decentralized exchanges, aggregators and centralized platforms, with context on what makes each different."
      items={exchangeDirectory}
      category="exchange"
    />
  );
}
