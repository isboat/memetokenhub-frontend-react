import { gatewayRequest } from "../../services/gatewayClient";
export type HubKind = "upcoming" | "events" | "applications";
export interface UpcomingProfile {
  name: string;
  symbol: string;
  network: string;
  story: string;
  distribution: string;
  disclosures: string;
  launchAt: string;
  launchpad: string;
  launchType: string;
  logoUrl: string;
  websiteUrl: string;
  telegramUrl: string;
  contractAddress: string;
  tradingUrl: string;
  sponsored: boolean;
}
export interface Space {
  title: string;
  subject: string;
  host: string;
  startsAt: string;
  eventUrl: string;
  recordingUrl: string;
  summary: string;
  ownerReviewed: boolean;
}
export interface ListingApplication {
  category: "network" | "exchange" | "launchpad";
  name: string;
  websiteUrl: string;
  story: string;
  contactEmail: string;
}
export interface Revision<T> {
  version: number;
  at: string;
  stage: string;
  data: T;
}
export interface HubEntry<T> {
  id: string;
  kind: HubKind;
  ownerId: string;
  data: T;
  stage: string;
  tokenId?: string;
  version: number;
  updatedAt: string;
  history: Revision<T>[];
}
export const hubConnected = Boolean(import.meta.env.VITE_API_BASE_URL);
export const launchStages = [
  "Upcoming",
  "Contract published",
  "Trading live",
  "MTH profile created",
];
export function safeLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
export function utcDate(value: string) {
  return (
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(value)) + " UTC"
  );
}
const sample: HubEntry<UpcomingProfile> = {
  id: "pepeasteroid",
  kind: "upcoming",
  ownerId: "sample",
  stage: "Upcoming",
  version: 1,
  updatedAt: "2026-08-01T12:00:00Z",
  data: {
    name: "PEPEASTEROID",
    symbol: "ASTEROID",
    network: "Robinhood Chain",
    story:
      "A community-created meme token inspired by Asteroid, the Shiba Inu associated with the Inspiration4 space mission. This is the project-supplied example, not an independently confirmed account of its origin or affiliations.",
    distribution:
      "Token distribution has not been supplied. Request allocation, vesting, liquidity and team-wallet details before participating.",
    disclosures:
      "Contract not yet published. Launch details and project affiliations are unconfirmed. No investment returns are promised. No relationship with MTH, Robinhood or the Inspiration4 mission has been established.",
    launchAt: "2026-08-28T14:00:00Z",
    launchpad: "PONS",
    launchType: "Fair launch",
    logoUrl: "",
    websiteUrl: "",
    telegramUrl: "",
    contractAddress: "",
    tradingUrl: "",
    sponsored: true,
  },
  history: [],
};
sample.history = [
  { version: 1, at: sample.updatedAt, stage: sample.stage, data: sample.data },
];
const events: HubEntry<Space>[] = [
  {
    id: "sample-space",
    kind: "events",
    ownerId: "sample",
    stage: "Published",
    version: 1,
    updatedAt: "2026-08-01T12:00:00Z",
    data: {
      title: "Before the countdown: launch safety",
      subject: "Token launches, contract checks and community questions",
      host: "MTH sample host",
      startsAt: "2026-08-20T17:00:00Z",
      eventUrl: "",
      recordingUrl: "",
      summary:
        "Example archive entry. A published event would show the owner-reviewed meeting summary and an official recording here.",
      ownerReviewed: true,
    },
    history: [],
  },
];
function localEntries<T>(kind: HubKind): HubEntry<T>[] {
  const raw = localStorage.getItem(`mth-hub-preview-${kind}`);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed))
    throw new Error(
      "Saved preview data is invalid. Clear this site’s preview storage to continue.",
    );
  return parsed as HubEntry<T>[];
}
async function response<T>(r: Response): Promise<T> {
  if (!r.ok) {
    const body = (await r.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new Error(
      body?.detail ??
        (r.status === 401
          ? "Sign in to continue."
          : r.status === 403
            ? "Your account does not have access to this action."
            : "The Hub request failed. Please retry."),
    );
  }
  return r.json() as Promise<T>;
}
export async function listHub<T>(kind: HubKind): Promise<HubEntry<T>[]> {
  if (hubConnected) return response(await gatewayRequest(`/api/hub/${kind}`));
  const seeds =
    kind === "upcoming" ? [sample] : kind === "events" ? events : [];
  return [...localEntries<T>(kind), ...(seeds as unknown as HubEntry<T>[])];
}
export async function saveHub<T>(
  kind: HubKind,
  data: T,
  entry?: HubEntry<T>,
): Promise<HubEntry<T>> {
  if (hubConnected)
    return response(
      await gatewayRequest(`/api/hub/${kind}${entry ? `/${entry.id}` : ""}`, {
        method: entry ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, version: entry?.version ?? 0 }),
      }),
    );
  if (entry?.ownerId === "sample")
    throw new Error(
      "Sample records are read-only. Create your own local preview.",
    );
  const now = new Date().toISOString();
  const saved: HubEntry<T> = {
    id: entry?.id ?? crypto.randomUUID(),
    kind,
    ownerId: "local-preview",
    data,
    stage:
      entry?.stage ??
      (kind === "upcoming"
        ? "Upcoming"
        : kind === "applications"
          ? "Local draft · not submitted"
          : "Published"),
    version: (entry?.version ?? 0) + 1,
    updatedAt: now,
    history: [],
  };
  saved.history = [
    ...(entry?.history ?? []),
    { version: saved.version, at: now, stage: saved.stage, data },
  ];
  localStorage.setItem(
    `mth-hub-preview-${kind}`,
    JSON.stringify([
      saved,
      ...localEntries<T>(kind).filter((x) => x.id !== saved.id),
    ]),
  );
  return saved;
}
export async function advanceLaunch(
  entry: HubEntry<UpcomingProfile>,
  data: UpcomingProfile,
): Promise<HubEntry<UpcomingProfile>> {
  if (!hubConnected)
    throw new Error(
      "Online milestone publishing and permanent token creation are unavailable in this preview.",
    );
  return response(
    await gatewayRequest(`/api/hub/upcoming/${entry.id}/advance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, version: entry.version }),
    }),
  );
}
export function downloadCalendar(id: string, title: string, startsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const stamp = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const escape = (s: string) =>
    s
      .replace(/\\/g, "\\\\")
      .replace(/[\r\n]+/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MTH//Launch calendar//EN",
    "BEGIN:VEVENT",
    `UID:${escape(id)}@memetokenhub.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(title)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob([calendar], { type: "text/calendar;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "mth-reminder.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function getLaunchFollow(
  id: string,
): Promise<{ following: boolean }> {
  return response(
    await gatewayRequest(`/api/hub/upcoming/${encodeURIComponent(id)}/follow`),
  );
}
export async function setLaunchFollow(
  id: string,
  following: boolean,
): Promise<{ following: boolean }> {
  return response(
    await gatewayRequest(`/api/hub/upcoming/${encodeURIComponent(id)}/follow`, {
      method: following ? "PUT" : "DELETE",
    }),
  );
}
