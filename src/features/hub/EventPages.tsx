import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CalendarPlus, Mic } from "lucide-react";
import { useAuth } from "../../auth/authContext";
import {
  downloadCalendar,
  hubConnected,
  saveHub,
  utcDate,
  type HubEntry,
  type Space,
} from "./api";
import { ExternalLink, HubLayout } from "./HubLayout";
import { useHub } from "./useHub";
const blank: Space = {
  title: "",
  subject: "",
  host: "",
  startsAt: "",
  eventUrl: "",
  recordingUrl: "",
  summary: "",
  ownerReviewed: false,
};
export function EventsPage() {
  const { entries, loading, error, reload } = useHub<Space>("events");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const now = Date.now();
  const visible = entries
    .filter(
      (x) =>
        `${x.data.title} ${x.data.subject} ${x.data.host}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (period === "All" ||
          (period === "Upcoming"
            ? new Date(x.data.startsAt).getTime() > now
            : new Date(x.data.startsAt).getTime() <= now)) &&
        (!from || x.data.startsAt.slice(0, 10) >= from) &&
        (!to || x.data.startsAt.slice(0, 10) <= to),
    )
    .sort((a, b) =>
      period === "Upcoming"
        ? Date.parse(a.data.startsAt) - Date.parse(b.data.startsAt)
        : Date.parse(b.data.startsAt) - Date.parse(a.data.startsAt),
    );
  return (
    <HubLayout
      title="Good conversations deserve a home."
      description="Find upcoming spaces, revisit previous meetings and search the archive by title, subject or date. All displayed times are UTC."
      action={
        <Link className="button button-primary" to="/events/new">
          <Mic size={17} /> Add a space or event
        </Link>
      }
    >
      <div className="hub-toolbar">
        <label className="hub-search">
          <span className="sr-only">Search events</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, subjects or hosts…"
          />
        </label>
        <label>
          <span className="sr-only">Event period</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>All</option>
            <option>Upcoming</option>
            <option>Previous</option>
          </select>
        </label>
        <label>
          From (UTC)
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          To (UTC)
          <input
            type="date"
            min={from}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      {loading && <p role="status">Loading events…</p>}
      {error && (
        <p role="alert">
          {error} <button onClick={() => void reload()}>Retry</button>
        </p>
      )}
      <p role="status">{message}</p>
      <div className="hub-grid">
        {visible.map((entry) => (
          <article className="hub-card" key={entry.id}>
            <div className="hub-badges">
              <span className="hub-tag">
                {Date.parse(entry.data.startsAt) > now
                  ? "Upcoming"
                  : "Previous space"}
              </span>
              {entry.ownerId === "sample" && (
                <span className="hub-tag">Example event</span>
              )}
            </div>
            <h2>{entry.data.title}</h2>
            <p>{entry.data.subject}</p>
            <p className="hub-muted">
              Hosted by {entry.data.host}
              <br />
              {utcDate(entry.data.startsAt)}
            </p>
            <div className="hub-actions">
              <ExternalLink url={entry.data.eventUrl}>Event page</ExternalLink>
              <ExternalLink url={entry.data.recordingUrl}>
                Listen to recording
              </ExternalLink>
              {Date.parse(entry.data.startsAt) > now && (
                <button
                  className="button button-secondary"
                  onClick={() => {
                    downloadCalendar(
                      entry.id,
                      entry.data.title,
                      entry.data.startsAt,
                    );
                    setMessage(
                      "Calendar event downloaded. Import it into your calendar to activate the reminder.",
                    );
                  }}
                >
                  <CalendarPlus size={15} />
                  Remind me
                </button>
              )}
              {entry.ownerId !== "sample" &&
                (!hubConnected ||
                  entry.ownerId === user?.userId ||
                  ["Admin", "Moderator"].includes(user?.role ?? "")) && (
                  <Link
                    to={`/events/${entry.id}/edit`}
                    className="hub-external"
                  >
                    Edit event
                  </Link>
                )}
            </div>
            {entry.data.summary ? (
              <details className="hub-history">
                <summary>Owner-reviewed recap</summary>
                <p className="hub-preserve">{entry.data.summary}</p>
                <span className="hub-muted">
                  Supplied and reviewed by the event owner. This is not an
                  independently verified transcript.
                </span>
              </details>
            ) : (
              <p className="hub-muted">
                The owner has not published a reviewed summary.
              </p>
            )}
          </article>
        ))}
      </div>
      {!loading && !error && !visible.length && (
        <p className="hub-empty">
          No events match this title, subject or date range.
        </p>
      )}
    </HubLayout>
  );
}
export function EventEditor() {
  const { id } = useParams();
  const { entries, loading, error } = useHub<Space>("events");
  const existing = entries.find((x) => x.id === id);
  if (id && loading)
    return (
      <HubLayout title="Loading event…" description="">
        <p role="status">Loading…</p>
      </HubLayout>
    );
  if (id && !existing)
    return (
      <HubLayout
        title="Event unavailable"
        description={error || "The event could not be found."}
      >
        <Link to="/events">Back to events</Link>
      </HubLayout>
    );
  return <SpaceForm key={id ?? "new"} existing={existing} />;
}
function SpaceForm({ existing }: { existing?: HubEntry<Space> }) {
  const { user, status, login } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Space>(existing?.data ?? blank);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const canEdit =
    !hubConnected ||
    (status === "authenticated" &&
      (user?.capabilities?.includes("posts:write") ||
        ["KOL", "Creator", "Admin", "Moderator"].includes(user?.role ?? "")) &&
      (!existing ||
        existing.ownerId === user?.userId ||
        ["Admin", "Moderator"].includes(user?.role ?? "")));
  function field(key: keyof Space, value: string | boolean) {
    setDraft((x) => ({
      ...x,
      [key]: value,
      ...(key === "summary" ? { ownerReviewed: false } : {}),
    }));
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.eventUrl && !draft.recordingUrl) {
      setMessage("Provide an event page or an MP3/recording link.");
      return;
    }
    setBusy(true);
    try {
      await saveHub("events", draft, existing);
      navigate("/events");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save the event.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <HubLayout
      title={
        existing
          ? "Keep the conversation current."
          : "Put the conversation on the calendar."
      }
      description="KOLs and event owners can publish a space, add a hosted MP3 recording and share a reviewed recap."
    >
      {!canEdit ? (
        <section className="hub-card">
          <h2>Event owner access required</h2>
          <p>
            Sign in with an account approved to host events. Only the owner or a
            moderator can edit an event.
          </p>
          {status !== "authenticated" && (
            <button className="button button-primary" onClick={login}>
              Sign in
            </button>
          )}
        </section>
      ) : (
        <form className="hub-card hub-form" onSubmit={submit}>
          <label>
            Event title
            <input
              required
              maxLength={200}
              value={draft.title}
              onChange={(e) => field("title", e.target.value)}
            />
          </label>
          <label>
            Subject / header
            <input
              required
              maxLength={200}
              value={draft.subject}
              onChange={(e) => field("subject", e.target.value)}
            />
          </label>
          <label>
            Host / KOL
            <input
              required
              maxLength={100}
              value={draft.host}
              onChange={(e) => field("host", e.target.value)}
            />
          </label>
          <label>
            Start date & time (UTC)
            <input
              type="datetime-local"
              required
              value={draft.startsAt.slice(0, 16)}
              onChange={(e) =>
                field("startsAt", e.target.value ? `${e.target.value}:00Z` : "")
              }
            />
          </label>
          <label>
            Official event page
            <input
              type="url"
              pattern="https://.*"
              value={draft.eventUrl}
              onChange={(e) => field("eventUrl", e.target.value)}
            />
          </label>
          <label>
            Hosted MP3 / recording URL
            <input
              type="url"
              pattern="https://.*"
              value={draft.recordingUrl}
              onChange={(e) => field("recordingUrl", e.target.value)}
            />
          </label>
          <aside className="hub-notice hub-wide">
            <strong>Recording and AI recap.</strong> You can link a hosted
            recording now. Direct MP3 upload and AI recaps are not available
            yet. You can publish a summary you have reviewed below.
          </aside>
          <label className="hub-wide">
            Meeting summary
            <textarea
              rows={8}
              maxLength={6000}
              value={draft.summary}
              onChange={(e) => field("summary", e.target.value)}
            />
          </label>
          <label className="hub-check hub-wide">
            <input
              type="checkbox"
              required={Boolean(draft.summary)}
              checked={draft.ownerReviewed}
              onChange={(e) => field("ownerReviewed", e.target.checked)}
            />
            I own or am authorized to share this recording, and I have checked
            the summary for accuracy and consent.
          </label>
          <div className="hub-actions">
            <button className="button button-primary" disabled={busy}>
              {busy
                ? "Saving…"
                : hubConnected
                  ? "Publish event"
                  : "Save local event preview"}
            </button>
            <Link to="/events" className="button button-secondary">
              Cancel
            </Link>
          </div>
          <p role="alert">{message}</p>
        </form>
      )}
    </HubLayout>
  );
}
