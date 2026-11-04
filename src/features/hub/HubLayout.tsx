import { ArrowUpRight, Compass } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { hubConnected, safeLink } from "./api";
const hubSections = [
  ["/upcoming", "Upcoming projects"],
  ["/launchpads", "Launchpads"],
  ["/events", "Spaces & events"],
  ["/exchanges", "Exchanges"],
  ["/hub/activity", "Hub activity"],
  ["/networks", "Networks"],
];
export function HubLayout({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <main className="page-shell hub-page">
      <header className="hub-hero">
        <div>
          <span className="eyebrow purple">
            <Compass size={15} /> THE COMMUNITY RADAR
          </span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {action}
      </header>
      <nav className="hub-navigation" aria-label="Hub navigation">
        {hubSections.map(([to, label]) => (
          <NavLink key={to} to={to} end>
            {label}
          </NavLink>
        ))}
      </nav>
      {!hubConnected && (
        <p className="hub-notice" role="note">
          <strong>Local preview.</strong> Example projects and events are
          labelled. Drafts stay in this browser; they are not public
          submissions. Online publishing is unavailable in this preview.
        </p>
      )}
      {children}
    </main>
  );
}
export function ExternalLink({
  url,
  children,
}: {
  url?: string;
  children: ReactNode;
}) {
  const href = url && safeLink(url);
  return href ? (
    <a
      className="hub-external"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={15} />
    </a>
  ) : null;
}
export function HubHomePage() {
  return (
    <HubLayout
      title="A little earlier. A lot more context."
      description="Meet projects before launch. Find the spaces, platforms and communities behind the next chapter."
    >
      <div className="hub-grid">
        {hubSections.map(([url, title], i) => (
          <Link className="hub-card hub-door" to={url} key={url}>
            <span className="hub-number">0{i + 1}</span>
            <h2>{title}</h2>
            <p>
              {
                [
                  "Project stories, launch schedules and a permanent record of what comes next.",
                  "Explore independent platforms and understand where projects begin.",
                  "Catch a conversation, revisit a recording and explore owner-reviewed recaps.",
                  "Get to know trading venues and apply to join the directory.",
                  "See changes to project social links with source attribution.",
                  "Explore the origin stories and cultures of the networks.",
                ][i]
              }
            </p>
            <span className="hub-external">
              Explore <ArrowUpRight size={18} />
            </span>
          </Link>
        ))}
      </div>
    </HubLayout>
  );
}
