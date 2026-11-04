# Community Hub

The Hub adds a discovery surface at `/hub`, reachable from the main navigation. The existing `/projects/manage` workflow remains available through the footer.

| Route | Behavior |
| --- | --- |
| `/upcoming` | Search project stories, filter network/lifecycle, and open a promo profile. |
| `/upcoming/new`, `/upcoming/:id/edit` | Creator publishing/editing with logo, lore, UTC schedule, launchpad, distribution and safety disclosures. |
| `/upcoming/:id` | Original promo URL, follow preference, calendar download, public revision history and launch milestones. |
| `/launchpads` | Editorial platform directory and listing application. |
| `/events`, `/events/new`, `/events/:id/edit` | Upcoming/previous spaces; title/subject/host/date search; hosted recording links and owner-reviewed recaps. |
| `/exchanges` | Exchange/aggregator reference directory and application. |
| `/networks` | All 73 requested names, short history/context, official references where identified and applications for missing networks. |
| `/hub/activity` | Observed social-link changes with before/after links and source attribution. |

## Connected operation

Set `VITE_API_BASE_URL` to the platform API Gateway and configure that gateway to forward `/api/hub/*` to Token Service. This repository does not contain the Gateway configuration. The new API requires the updated Token Service and MongoDB. Authentication continues to use Privy and the exchanged platform JWT; no browser-held provider credential is introduced.

Upcoming publishing requires `projects:write` or a Moderator/Admin role. Event publishing requires `posts:write` or a KOL/Creator/Moderator/Admin role. Writes enforce ownership on the server. Listing applications require a signed-in account and are private to the applicant and moderators/admins. Applications are pending requests; submitting does not approve a directory entry. The initial directories remain editorial data in `src/features/hub/catalog.ts`; no automatic or paid approval is implied.

Following uses the account-backed `/api/hub/upcoming/:id/follow` endpoint. Calendar reminders download an `.ics` event containing a 15-minute alarm. Users must import it into their calendar; browser notifications and email delivery are not implied.

Project milestones are owner-reported: Upcoming → Contract published → Trading live → MTH profile created. The last action creates a real published, **Unclaimed** token record. It does not verify investment quality or award a badge. The original promo and revisions remain, and the canonical token links back to its launch history. Published identity cannot be silently changed; history is append-only. After trading is marked live, metadata is pinned for conversion. Subsequent canonical edits use the existing token management workflow.

## Local preview

Without `VITE_API_BASE_URL`, the Hub explicitly uses local preview mode. Drafts/application drafts are saved only to this browser’s local storage; they are not submitted to MTH. Example records are read-only and labelled. Permanent token conversion is disabled; it is never simulated as a completed publication. Preview drafts are not uploaded automatically when an API is later connected.

PEPEASTEROID is the supplied example. Its 28 August 2026 schedule is preserved and shown as elapsed when appropriate. Its origin story, PONS platform, network and affiliations have not been independently confirmed. It has no invented Telegram link, contract, distribution or MTH affiliation.

## Integrations still required

- Direct MP3 upload and AI transcription/summary generation are not implemented because the hosting/transcription provider has not been selected. The current form accepts a hosted recording URL and a summary the owner has reviewed; it makes no AI-generation claim. Provider credentials must remain server-side. Consent, upload limits and owner review must be enforced when the recording pipeline is added.
- DEX Screener collection exists in Token Service and is off by default. See its README for enabling it and the required destination. It samples the latest profile feed; it is not a complete history of every token or an independent verification service.
- DEXTools ingestion needs its authorized source integration; the source filter is present but no DEXTools observations are fabricated.
- Review the network directory’s official identities and current deployment status before production publication, especially ambiguous names such as Stable and the project-supplied PONS reference.

## Validation

`npm run build`, `npm run lint`, `npm test`, and the existing Playwright command (`npm run test:e2e`) validate the frontend. `e2e/hub.spec.ts` covers directory applications, elapsed schedules, local following/draft persistence, calendar downloads, archived event search/recaps, mobile navigation and unknown-token handling. Standard Playwright Chromium installation is documented in the main README. In the managed cloud instance, an external Playwright config uses the preinstalled `/usr/bin/chromium` without changing the repository configuration.
