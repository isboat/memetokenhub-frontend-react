import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CalendarPlus, Rocket, Star } from "lucide-react";
import { useAuth } from "../../auth/authContext";
import {
  advanceLaunch,
  getLaunchFollow,
  setLaunchFollow,
  downloadCalendar,
  hubConnected,
  launchStages,
  safeLink,
  saveHub,
  utcDate,
  type HubEntry,
  type UpcomingProfile,
} from "./api";
import { networkDirectory } from "./catalog";
import { HubLayout, ExternalLink } from "./HubLayout";
import { useHub } from "./useHub";
const blank: UpcomingProfile = {
  name: "",
  symbol: "",
  network: "Solana",
  story: "",
  distribution: "",
  disclosures: "",
  launchAt: "",
  launchpad: "",
  launchType: "Fair launch",
  logoUrl: "",
  websiteUrl: "",
  telegramUrl: "",
  contractAddress: "",
  tradingUrl: "",
  sponsored: false,
};
function LaunchBadge({ entry }: { entry: HubEntry<UpcomingProfile> }) {
  return (
    <>
      <span className="hub-tag">
        {entry.ownerId === "sample" ? "Supplied example" : entry.stage}
      </span>
      {entry.data.sponsored && (
        <span className="hub-tag hub-tag-gold">Sponsored</span>
      )}
    </>
  );
}
export function UpcomingPage() {
  const { entries, loading, error, reload } =
    useHub<UpcomingProfile>("upcoming");
  const [query, setQuery] = useState("");
  const [network, setNetwork] = useState("All");
  const [stage, setStage] = useState("All");
  const visible = entries
    .filter(
      (x) =>
        (network === "All" || x.data.network === network) &&
        (stage === "All" || x.stage === stage) &&
        `${x.data.name} ${x.data.symbol} ${x.data.story}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort(
      (a, b) =>
        new Date(a.data.launchAt).getTime() -
        new Date(b.data.launchAt).getTime(),
    );
  return (
    <HubLayout
      title="Meet them before liftoff."
      description="Project stories, lore and launch plans, before the charts. Follow the journey from an idea to a permanent token profile."
      action={
        <Link className="button button-primary" to="/upcoming/new">
          <Rocket size={17} /> List an upcoming project
        </Link>
      }
    >
      <div className="hub-toolbar">
        <label className="hub-search">
          <span className="sr-only">Search upcoming projects</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, symbols or stories…"
          />
        </label>
        <label>
          <span className="sr-only">Project network</span>
          <select value={network} onChange={(e) => setNetwork(e.target.value)}>
            <option>All</option>
            {[...new Set(entries.map((x) => x.data.network))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Launch stage</span>
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option>All</option>
            {launchStages.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      {loading && <p role="status">Loading projects…</p>}
      {error && (
        <p role="alert">
          {error} <button onClick={() => void reload()}>Retry</button>
        </p>
      )}
      <div className="hub-grid">
        {visible.map((entry) => (
          <Link
            className="hub-card hub-launch-card"
            key={entry.id}
            to={`/upcoming/${entry.id}`}
          >
            <div className="hub-badges">
              <LaunchBadge entry={entry} />
            </div>
            <div className="hub-project-heading">
              <span className="hub-project-icon">
                {entry.data.logoUrl && safeLink(entry.data.logoUrl) ? (
                  <img src={entry.data.logoUrl} alt="" loading="lazy" />
                ) : (
                  <Rocket />
                )}
              </span>
              <div>
                <h2>{entry.data.name}</h2>
                <span className="hub-muted">
                  ${entry.data.symbol} · {entry.data.network}
                </span>
              </div>
            </div>
            <p>{entry.data.story}</p>
            <dl className="hub-facts">
              <div>
                <dt>Scheduled launch</dt>
                <dd>{utcDate(entry.data.launchAt)}</dd>
              </div>
              <div>
                <dt>Launchpad</dt>
                <dd>{entry.data.launchpad}</dd>
              </div>
            </dl>
            {new Date(entry.data.launchAt) < new Date() &&
              entry.stage === "Upcoming" && (
                <p className="hub-muted">
                  Scheduled date has passed. Awaiting an owner update.
                </p>
              )}
            <span className="hub-external">
              Explore project <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </div>
      {!loading && !error && !visible.length && (
        <p className="hub-empty">No projects match these filters.</p>
      )}
      <aside className="hub-notice">
        <strong>Context before conviction.</strong> Project-supplied information
        is not an endorsement, investment-quality verification or promise of
        returns. A launch profile is separate from MTH verification.
      </aside>
    </HubLayout>
  );
}
export function UpcomingEditor() {
  const { id } = useParams();
  const { entries, loading, error } = useHub<UpcomingProfile>("upcoming");
  const existing = entries.find((x) => x.id === id);
  if (id && loading)
    return (
      <HubLayout
        title="Loading project…"
        description="Retrieving the current profile."
      >
        <p role="status">Loading…</p>
      </HubLayout>
    );
  if (id && !existing)
    return (
      <HubLayout
        title="Project unavailable"
        description={error || "This project could not be found."}
      >
        <Link to="/upcoming">Back to upcoming projects</Link>
      </HubLayout>
    );
  return <ProjectEditor key={existing?.id ?? "new"} existing={existing} />;
}
function ProjectEditor({ existing }: { existing?: HubEntry<UpcomingProfile> }) {
  const { user, status, login } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<UpcomingProfile>(existing?.data ?? blank);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const permitted =
    !hubConnected ||
    (status === "authenticated" &&
      (user?.capabilities?.includes("projects:write") ||
        ["Moderator", "Admin"].includes(user?.role ?? "")) &&
      (!existing ||
        existing.ownerId === user?.userId ||
        ["Moderator", "Admin"].includes(user?.role ?? "")));
  function field(key: keyof UpcomingProfile, value: string | boolean) {
    setDraft((x) => ({ ...x, [key]: value }));
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const saved = await saveHub("upcoming", draft, existing);
      navigate(`/upcoming/${saved.id}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <HubLayout
      title={
        existing ? "Edit your launch story." : "Give your next project a home."
      }
      description="Publish your story before the contract exists. Launch times use UTC; changes remain in the project’s public history."
    >
      {!permitted ? (
        <section className="hub-card">
          <h2>Project creator access required</h2>
          <p>
            Sign in with a project creator account to publish. Only a project’s
            owner or a moderator may edit it.
          </p>
          {status !== "authenticated" && (
            <button className="button button-primary" onClick={login}>
              Sign in
            </button>
          )}
        </section>
      ) : existing?.ownerId === "sample" ? (
        <p className="hub-empty">
          Sample profiles are read-only.{" "}
          <Link to="/upcoming/new">Create your own preview.</Link>
        </p>
      ) : (
        <form className="hub-card hub-form" onSubmit={submit}>
          <label>
            Project name
            <input
              required
              maxLength={100}
              value={draft.name}
              onChange={(e) => field("name", e.target.value)}
            />
          </label>
          <label>
            Token symbol
            <input
              required
              maxLength={15}
              value={draft.symbol}
              onChange={(e) => field("symbol", e.target.value)}
            />
          </label>
          <label>
            Network
            <input
              list="hub-networks"
              required
              disabled={Boolean(existing)}
              maxLength={50}
              value={draft.network}
              onChange={(e) => field("network", e.target.value)}
            />
            <datalist id="hub-networks">
              {networkDirectory.map((x) => (
                <option key={x.name} value={x.name} />
              ))}
            </datalist>
          </label>
          <label>
            Scheduled launch (UTC)
            <input
              required
              type="datetime-local"
              value={draft.launchAt ? draft.launchAt.slice(0, 16) : ""}
              onChange={(e) =>
                field("launchAt", e.target.value ? `${e.target.value}:00Z` : "")
              }
            />
          </label>
          <label>
            Launchpad
            <input
              required
              maxLength={100}
              value={draft.launchpad}
              onChange={(e) => field("launchpad", e.target.value)}
            />
          </label>
          <label>
            Launch type
            <input
              required
              maxLength={100}
              value={draft.launchType}
              onChange={(e) => field("launchType", e.target.value)}
            />
          </label>
          <label>
            Logo URL
            <input
              required
              type="url"
              pattern="https://.*"
              value={draft.logoUrl}
              onChange={(e) => field("logoUrl", e.target.value)}
            />
          </label>
          <label>
            Official website
            <input
              type="url"
              pattern="https://.*"
              value={draft.websiteUrl}
              onChange={(e) => field("websiteUrl", e.target.value)}
            />
          </label>
          <label>
            Official Telegram
            <input
              type="url"
              pattern="https://.*"
              value={draft.telegramUrl}
              onChange={(e) => field("telegramUrl", e.target.value)}
            />
          </label>
          {(["story", "distribution", "disclosures"] as const).map((key) => (
            <label className="hub-wide" key={key}>
              {key === "story"
                ? "Story & lore"
                : key === "distribution"
                  ? "Token distribution, allocation & vesting"
                  : "Safety disclosures & affiliations"}
              <textarea
                required
                rows={4}
                maxLength={2000}
                value={draft[key]}
                onChange={(e) => field(key, e.target.value)}
              />
            </label>
          ))}
          <label className="hub-wide hub-check">
            <input
              type="checkbox"
              checked={draft.sponsored}
              onChange={(e) => field("sponsored", e.target.checked)}
            />
            This is a sponsored promotional profile
          </label>
          <label className="hub-wide hub-check">
            <input type="checkbox" required />I am authorized to publish these
            details and understand that updates are permanently recorded.
          </label>
          <div className="hub-actions">
            <button className="button button-primary" disabled={busy}>
              {busy
                ? "Saving…"
                : hubConnected
                  ? "Publish project profile"
                  : "Save local project preview"}
            </button>
            <Link
              className="button button-secondary"
              to={existing ? `/upcoming/${existing.id}` : "/upcoming"}
            >
              Cancel
            </Link>
          </div>
          <p role="alert">{message}</p>
        </form>
      )}
    </HubLayout>
  );
}
export function UpcomingDetailsPage() {
  const { id } = useParams();
  const { entries, loading, error, reload } =
    useHub<UpcomingProfile>("upcoming");
  const entry = entries.find((x) => x.id === id);
  if (loading)
    return (
      <HubLayout title="Loading launch story…" description="">
        <p role="status">Loading…</p>
      </HubLayout>
    );
  if (!entry)
    return (
      <HubLayout
        title="Project unavailable"
        description={error || "This project could not be found."}
      >
        <Link to="/upcoming">Browse upcoming projects</Link>
        {error && <button onClick={() => void reload()}>Retry</button>}
      </HubLayout>
    );
  return <ProjectDetails key={entry.id} entry={entry} reload={reload} />;
}
function ProjectDetails({
  entry,
  reload,
}: {
  entry: HubEntry<UpcomingProfile>;
  reload: () => Promise<void>;
}) {
  const { user, status, login } = useAuth();
  const [followed, setFollowed] = useState(() => {
    try {
      return localStorage.getItem(`mth-follow-launch-${entry.id}`) === "true";
    } catch {
      return false;
    }
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [contract, setContract] = useState(entry.data.contractAddress);
  const [trading, setTrading] = useState(entry.data.tradingUrl);
  const canEdit =
    entry.ownerId !== "sample" &&
    (!hubConnected ||
      entry.ownerId === user?.userId ||
      ["Admin", "Moderator"].includes(user?.role ?? ""));
  const data = entry.data;
  const elapsed = new Date(data.launchAt) <= new Date();
  async function advance(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await advanceLaunch(entry, {
        ...data,
        contractAddress: contract,
        tradingUrl: trading,
      });
      await reload();
      setMessage("Launch record updated.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not advance.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!hubConnected) return;
    setFollowed(false);
    if (status !== "authenticated") return;
    let active = true;
    getLaunchFollow(entry.id)
      .then((result) => {
        if (active) setFollowed(result.following);
      })
      .catch(() => {
        if (active) setMessage("Could not load your following preference.");
      });
    return () => {
      active = false;
    };
  }, [entry.id, status, user?.userId]);
  async function follow() {
    if (hubConnected) {
      if (status !== "authenticated") {
        login();
        setMessage("Sign in to follow this project.");
        return;
      }
      setBusy(true);
      try {
        const result = await setLaunchFollow(entry.id, !followed);
        setFollowed(result.following);
        setMessage(
          result.following
            ? "You are following this project. Calendar reminders are separate."
            : "You unfollowed this project.",
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not save your following preference.",
        );
      } finally {
        setBusy(false);
      }
      return;
    }
    try {
      localStorage.setItem(`mth-follow-launch-${entry.id}`, String(!followed));
      setFollowed(!followed);
      setMessage(
        "Following preference saved on this device. Calendar reminders are separate.",
      );
    } catch {
      setMessage("This browser could not save your following preference.");
    }
  }
  return (
    <HubLayout
      title={`Meet ${data.name} — $${data.symbol}`}
      description={data.story}
      action={
        canEdit && !entry.tokenId ? (
          <Link
            className="button button-secondary"
            to={`/upcoming/${entry.id}/edit`}
          >
            Edit project
          </Link>
        ) : undefined
      }
    >
      <div className="hub-badges">
        <LaunchBadge entry={entry} />
      </div>
      {entry.ownerId === "sample" && (
        <p className="hub-notice">
          Illustrative promo supplied in the feature brief. The launch, lore,
          platform and affiliations have not been independently confirmed.
        </p>
      )}
      <div className="hub-detail-grid">
        <section className="hub-card">
          <h2>Scheduled to launch on {data.launchpad}</h2>
          <dl className="hub-facts">
            <div>
              <dt>Date & time</dt>
              <dd>{utcDate(data.launchAt)}</dd>
            </div>
            <div>
              <dt>Network</dt>
              <dd>{data.network}</dd>
            </div>
            <div>
              <dt>Launch type</dt>
              <dd>{data.launchType}</dd>
            </div>
            <div>
              <dt>Contract</dt>
              <dd className="hub-address">
                {data.contractAddress || "Not yet published"}
              </dd>
            </div>
          </dl>
          {elapsed && entry.stage === "Upcoming" && (
            <p className="hub-notice">
              The scheduled date has passed. No launch confirmation has been
              published.
            </p>
          )}
          <div className="hub-actions">
            <button
              className="button button-secondary"
              aria-pressed={followed}
              disabled={busy}
              onClick={() => void follow()}
            >
              <Star size={16} />
              {followed
                ? hubConnected
                  ? "Following project"
                  : "Following on this device"
                : "Follow project"}
            </button>
            <button
              className="button button-primary"
              disabled={elapsed}
              onClick={() => {
                downloadCalendar(
                  entry.id,
                  `${data.name} scheduled launch`,
                  data.launchAt,
                );
                setMessage(
                  "Calendar file downloaded. Import it into your calendar to activate the reminder.",
                );
              }}
            >
              <CalendarPlus size={16} />
              Set launch reminder
            </button>
            <ExternalLink url={data.telegramUrl}>Join Telegram</ExternalLink>
            <ExternalLink url={data.websiteUrl}>Official website</ExternalLink>
          </div>
          <p className="hub-muted">
            {hubConnected
              ? "Following is saved to your account."
              : "Following is saved on this device."}{" "}
            Launch reminders download a calendar event with a 15-minute alert;
            your calendar controls delivery.
          </p>
          <p role="status">{message}</p>
        </section>
        <aside className="hub-card hub-lifecycle">
          <span className="eyebrow purple">A PERMANENT PROJECT STORY</span>
          <h2>From upcoming to on-chain.</h2>
          <ol>
            {launchStages.map((stage, i) => (
              <li
                key={stage}
                aria-current={entry.stage === stage ? "step" : undefined}
                className={
                  i <= launchStages.indexOf(entry.stage) ? "complete" : ""
                }
              >
                <span>{i + 1}</span>
                {stage}
              </li>
            ))}
          </ol>
          {entry.tokenId && (
            <Link
              className="button button-primary"
              to={`/token/${entry.tokenId}`}
            >
              See MTH profile <ArrowRight size={16} />
            </Link>
          )}
          <p className="hub-muted">
            Launch milestones are owner-reported. Creating an MTH profile does
            not grant a verification badge.
          </p>
        </aside>
        <section className="hub-card">
          <h2>Token distribution</h2>
          <p className="hub-preserve">{data.distribution}</p>
        </section>
        <section className="hub-card">
          <h2>Safety & affiliations</h2>
          <p className="hub-preserve">{data.disclosures}</p>
        </section>
      </div>
      <aside className="hub-notice">
        <strong>
          {data.sponsored
            ? "Sponsored upcoming-project profile."
            : "Project-supplied profile."}
        </strong>{" "}
        Information was supplied by the project. Listing does not represent
        endorsement, verification of investment quality or a promise of returns.
        This project is not affiliated with MTH unless evidence of that
        relationship is displayed.
      </aside>
      {canEdit && !entry.tokenId && (
        <section className="hub-card">
          <h2>Update the launch milestone</h2>
          <p>
            The existing promo URL and history remain available after
            conversion.
          </p>
          <form className="hub-form" onSubmit={advance}>
            <label>
              Published contract address
              <input
                required
                disabled={entry.stage !== "Upcoming"}
                maxLength={200}
                value={contract}
                onChange={(e) => setContract(e.target.value)}
              />
            </label>
            <label>
              Official trading page
              <input
                type="url"
                pattern="https://.*"
                required={entry.stage !== "Upcoming"}
                value={trading}
                onChange={(e) => setTrading(e.target.value)}
              />
            </label>
            <label className="hub-check hub-wide">
              <input type="checkbox" required />I confirm these details are
              accurate and understand this does not verify the project.
            </label>
            <button
              className="button button-primary"
              disabled={busy || !hubConnected}
            >
              {busy
                ? "Updating…"
                : entry.stage === "Upcoming"
                  ? "Publish contract"
                  : entry.stage === "Contract published"
                    ? "Confirm trading live"
                    : "Create permanent MTH profile"}
            </button>
            {!hubConnected && (
              <p>
                Online milestone publishing and permanent token creation are
                unavailable in this preview.
              </p>
            )}
          </form>
        </section>
      )}
      <section className="hub-card">
        <h2>Permanent update history</h2>
        <p>
          Every published revision is retained with its timestamp and the
          information supplied at that time.
        </p>
        {[...entry.history].reverse().map((revision) => (
          <details className="hub-history" key={revision.version}>
            <summary>
              Revision {revision.version} · {revision.stage} ·{" "}
              {utcDate(revision.at)}
            </summary>
            <dl className="hub-facts">
              {Object.entries(revision.data).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd className="hub-preserve">
                    {String(value) || "Not supplied"}
                  </dd>
                </div>
              ))}
            </dl>
          </details>
        ))}
      </section>
    </HubLayout>
  );
}
