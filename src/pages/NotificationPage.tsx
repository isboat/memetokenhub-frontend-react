import {
  Bell,
  BellRing,
  CheckCheck,
  LockKeyhole,
  Settings2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import {
  type DigestFrequency,
  getMyNotificationPreferences,
  getMyNotifications,
  type HubNotification,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationChannel,
  type NotificationEventType,
  type NotificationPreferences,
  updateMyNotificationPreferences,
} from "../services/notificationService";

const eventTypes: NotificationEventType[] = [
  "ClaimApproval",
  "ClaimUpdate",
  "ProjectPublished",
  "KolSupportedToken",
  "NewFollower",
  "NewPost",
  "VoteMilestone",
  "Subscription",
  "PaymentConfirmed",
];
const channels: NotificationChannel[] = ["InApp", "Email", "Push"];
const defaultPreferences: NotificationPreferences = {
  channels: { InApp: true, Email: false, Push: false },
  events: {},
  digestFrequency: "Immediate",
};

function title(value: string) {
  return value.replace(/([A-Z])/g, " $1").trim();
}

export function NotificationPage() {
  const { errorMessage, status, login, logout, retryExchange } = useAuth();
  const [notifications, setNotifications] = useState<HubNotification[]>([]);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated")
      Promise.all([
        getMyNotifications(unreadOnly),
        getMyNotificationPreferences(),
      ])
        .then(([items, saved]) => {
          setNotifications(items);
          setPreferences(saved);
        })
        .catch((error: unknown) =>
          setMessage(
            error instanceof Error
              ? error.message
              : "Notifications could not be loaded.",
          ),
        );
  }, [status, unreadOnly]);

  if (status !== "authenticated") {
    const loading = status === "loading" || status === "exchanging";
    return (
      <main className="auth-page page-shell">
        <section className="auth-panel">
          <LockKeyhole />
          <h1>
            {loading
              ? "Loading your inbox…"
              : status === "error"
                ? "Your Privy login succeeded."
                : "Connect to view notifications."}
          </h1>
          <p>
            {status === "error"
              ? (errorMessage ?? "The MemeTokenHub token exchange failed.")
              : "Alerts and preferences are private to your account."}
          </p>
          {status === "anonymous" && (
            <button className="button button-primary" onClick={login}>
              Connect with Privy
            </button>
          )}
          {loading && (
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

  async function read(item: HubNotification) {
    if (item.isRead) return;
    try {
      const updated = await markNotificationRead(item.notificationId);
      setNotifications((current) =>
        current.map((entry) =>
          entry.notificationId === item.notificationId
            ? { ...entry, ...updated, isRead: true }
            : entry,
        ),
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not mark notification read.",
      );
    }
  }
  async function readAll() {
    setBusy(true);
    try {
      await markAllNotificationsRead();
      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true })),
      );
      setMessage("All notifications marked as read.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not mark all as read.",
      );
    } finally {
      setBusy(false);
    }
  }
  function toggleEvent(
    eventType: NotificationEventType,
    channel: NotificationChannel,
  ) {
    setPreferences((current) => ({
      ...current,
      events: {
        ...current.events,
        [eventType]: {
          ...current.events[eventType],
          [channel]: !(
            current.events[eventType]?.[channel] ?? current.channels[channel]
          ),
        },
      },
    }));
  }
  async function savePreferences() {
    setBusy(true);
    try {
      setPreferences(await updateMyNotificationPreferences(preferences));
      setMessage("Notification preferences saved.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Preferences could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="notifications-page page-shell">
      <header className="notification-hero">
        <div>
          <span className="eyebrow purple">
            <BellRing size={14} /> Notification center
          </span>
          <h1>Stay close, without the noise.</h1>
          <p>
            Choose immediate alerts or a digest for projects, creators,
            payments, social activity, and verification.
          </p>
        </div>
        <button
          className="button button-secondary"
          onClick={() => setShowPreferences((open) => !open)}
        >
          <Settings2 size={17} /> Preferences
        </button>
      </header>
      {message && (
        <p className="form-status" role="status">
          {message}
        </p>
      )}
      {showPreferences && (
        <section className="preference-panel">
          <div className="money-heading">
            <Settings2 />
            <div>
              <h2>Delivery preferences</h2>
              <p>
                Event and channel choices are allow-listed by Notification
                Service.
              </p>
            </div>
          </div>
          <div className="channel-toggles">
            {channels.map((channel) => (
              <label key={channel}>
                <input
                  type="checkbox"
                  checked={preferences.channels[channel]}
                  onChange={() =>
                    setPreferences((current) => ({
                      ...current,
                      channels: {
                        ...current.channels,
                        [channel]: !current.channels[channel],
                      },
                    }))
                  }
                />{" "}
                {channel}
              </label>
            ))}
          </div>
          <label className="digest-select">
            Digest frequency
            <select
              value={preferences.digestFrequency}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  digestFrequency: event.target.value as DigestFrequency,
                }))
              }
            >
              <option>Immediate</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Off</option>
            </select>
          </label>
          <div className="preference-matrix">
            <div className="matrix-heading">
              <strong>Event</strong>
              {channels.map((channel) => (
                <strong key={channel}>{channel}</strong>
              ))}
            </div>
            {eventTypes.map((eventType) => (
              <div key={eventType}>
                <span>{title(eventType)}</span>
                {channels.map((channel) => (
                  <label
                    key={channel}
                    aria-label={`${title(eventType)} via ${channel}`}
                  >
                    <input
                      type="checkbox"
                      checked={
                        preferences.events[eventType]?.[channel] ??
                        preferences.channels[channel]
                      }
                      onChange={() => toggleEvent(eventType, channel)}
                    />
                  </label>
                ))}
              </div>
            ))}
          </div>
          <button
            className="button button-primary"
            disabled={busy}
            onClick={() => void savePreferences()}
          >
            Save preferences
          </button>
        </section>
      )}
      <section className="inbox-panel">
        <div className="inbox-toolbar">
          <label>
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) => setUnreadOnly(event.target.checked)}
            />{" "}
            Unread only
          </label>
          <button
            className="text-button"
            disabled={busy}
            onClick={() => void readAll()}
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        </div>
        <div className="notification-list">
          {notifications.map((item) => (
            <article
              className={
                item.isRead ? "notification-item" : "notification-item unread"
              }
              key={item.notificationId}
              onClick={() => void read(item)}
            >
              <span className="notification-icon">
                <Bell size={18} />
              </span>
              <div>
                <div>
                  <strong>{item.title ?? title(item.type)}</strong>
                  <time>
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: "medium",
                    }).format(new Date(item.sentAt))}
                  </time>
                </div>
                <p>{item.message}</p>
                {item.actionUrl && (
                  <Link to={item.actionUrl}>View details</Link>
                )}
              </div>
              {!item.isRead && <i aria-label="Unread" />}
            </article>
          ))}
        </div>
        {!notifications.length && (
          <div className="notification-empty">
            <CheckCheck />
            <h2>You're all caught up.</h2>
            <p>No notifications match this view.</p>
          </div>
        )}
      </section>
    </main>
  );
}
