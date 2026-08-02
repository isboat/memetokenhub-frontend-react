# PR 1 Changelog — MemeTokenHub Frontend

## Changelog scope

This document records the complete frontend implementation delivered by the first MemeTokenHub frontend pull request. The change set transforms the repository from its initial placeholder into a runnable, typed, tested, responsive React single-page application with authentication, six backend-domain clients, user and moderator workflows, CI/CD, Azure Static Web Apps deployment configuration, and detailed project documentation.

The changelog covers the cumulative changes from the initial repository state and includes the follow-up corrections and informational pages added during review. The PR adds or updates 54 tracked paths and introduces more than 35,000 lines, most of which are the reproducible npm lockfile and the application source/styles.

## Implementation timeline

The cumulative PR was built through the following commits before this changelog was added:

| Commit    | Change                                                                                                                                                            |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `1ae3707` | Registered the MemeTokenHub documentation repository as the `docs/mth-docs` submodule.                                                                            |
| `aa39390` | Added the initial React/Vite scaffold, README, HTML entry, environment template, CI workflows, lint/format configuration, and lockfile.                           |
| `2ecac72` | Added the retry state for a successful Privy login followed by a failed platform-token exchange.                                                                  |
| `0819a7e` | Implemented the remaining User Service clients and profile, people, verification, social-channel, and administration experiences.                                 |
| `d6bb9f9` | Implemented the remaining Token Service clients, discovery reads, project management, media uploads, analytics, feeds, and publication.                           |
| `7b2ec54` | Addressed Token Service review feedback, including server-backed filtering, response normalization, media validation, HTTPS checks, and publication requirements. |
| `f026a32` | Implemented the remaining Social Service clients and Community, My network, Insights, public-profile social data, and token engagement features.                  |
| `6ae9eda` | Implemented the Claim Service client, claim center, moderation queue, public verification status, evidence uploads, and claim tests.                              |
| `c02b337` | Addressed Claim Service review feedback for public DTO redaction, appeal evidence, session loading, and moderator audit filtering.                                |
| `6b584f3` | Implemented Payment and Notification Service clients, checkout/access/earnings UI, notification inbox/preferences UI, routes, tests, and documentation.           |
| `af1a91e` | Applied correct Privy exchange-failure behavior to Verify and Launch through a shared protected-session panel.                                                    |
| `f9c5098` | Addressed payment and notification feedback for cancellation semantics, preference stability, read responses, accessibility, and safe links.                      |
| `8f61238` | Expanded the README with the application lifecycle, navigation, user journeys, account access, and every route.                                                   |

## Executive summary

### Added

- A React 19 and TypeScript application built with Vite.
- A responsive dark crypto/meme design system for mobile, tablet, and desktop.
- Nineteen named application routes plus a branded not-found experience.
- Privy email/wallet authentication followed by a backend platform-token exchange.
- An in-memory platform JWT and a shared API Gateway request client.
- Typed User, Token, Social, Claim, Payment, and Notification Service clients.
- Public discovery, project details, people search, profiles, leaderboards, social feeds, creator insights, project management, claim verification, moderation, payments, creator earnings, notifications, and account administration experiences.
- Signed media/evidence upload flows with client-side file validation.
- Security boundaries that keep internal webhooks, notification delivery, private claim evidence, and backend-authoritative state out of browser control.
- Vitest and Testing Library coverage for the main UI and service contracts.
- Playwright browser automation with a Chromium smoke test and a repeatable browser/system-dependency installation command.
- Reproducible Playwright screenshot capture for desktop and mobile visual review.
- Chromium smoke tests in both GitHub Actions workflows, isolated from opt-in screenshot scenarios.
- GitHub Actions workflows for pull-request verification and main-branch Azure deployment.
- A comprehensive README covering setup, architecture, service coverage, navigation, roles, routes, CI/CD, and dependency notices.
- A documentation submodule containing the source product and service specifications.

### Changed

- Replaced the original one-line README with full user, developer, architecture, and deployment documentation.
- Expanded `.gitignore` for local visual-review artifacts.
- Expanded `.gitignore` for generated Playwright reports, traces, and test results.
- Iteratively corrected authentication exchange failure states, token integration behavior, claim privacy, appeal evidence, payment cancellation semantics, notification preference stability, URL safety, and accessibility based on review feedback.

## Product experience

### Application shell and global navigation

- Added a shared application shell with a market-preview strip, sticky dark header, responsive desktop/mobile navigation, footer, and routed main content.
- Added the MemeTokenHub logo and brand treatment.
- Added primary navigation links for Discover, Community, Insights, People, Launch, Verify, and Learn.
- Added a notification bell shortcut, Watchlist/dashboard shortcut, search shortcut, Privy authentication control, profile shortcut, and sign-out action.
- Added a collapsible mobile menu with the same primary destinations.
- Added footer navigation for public exploration, company/trust information, notifications, payments and access, verification, and community channels.
- Added explicit “Demo data” and “Preview mode” labels so illustrative market figures are never represented as live data.
- Added route-aware scroll restoration so client-side page links open at the top rather than retaining the footer scroll position; valid fragment links still scroll to their target element.

### Responsive design system

- Added a dark, crypto-native visual language inspired by modern market-data and exchange products.
- Added reusable colors, gradients, typography, spacing, border, radius, shadow, button, form, badge, card, and layout rules.
- Added responsive behavior for wide desktops, tablets, and narrow mobile screens.
- Added responsive token grids, project/detail layouts, forms, tables, moderation cards, notification preferences, payment panels, and footer columns.
- Added keyboard-visible focus states, semantic labels, status messages, accessible buttons, and reduced-motion considerations.
- Added Lucide icons throughout navigation, forms, trust messaging, social features, moderation, payments, and notifications.

## Routing

The React Router application now supports:

| Route                     | Experience                                                                                       | Access                             |
| ------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `/`                       | Project discovery, search, network filters, trending feed, community leaders, and trust overview | Public                             |
| `/token/:tokenId`         | Canonical project details, analytics, sentiment, and Social Service engagement                   | Public reads; authenticated writes |
| `/community`              | Creator and collector reputation leaderboards                                                    | Public                             |
| `/network`                | Tracked users/tokens/networks and personalized activity feed                                     | Authenticated                      |
| `/insights`               | Post discovery and eligible creator/KOL publishing                                               | Public reads; role-gated writes    |
| `/people`                 | Public-safe people search                                                                        | Public                             |
| `/profile`                | Private profile, preferences, wallet, and social-channel management                              | Authenticated                      |
| `/profile/:userId`        | Public-safe user profile, reputation, follows, and activity                                      | Public                             |
| `/learn`                  | Trust, safety, verification, provenance, and organic-discovery education                         | Public                             |
| `/about`                  | Product mission and trust information                                                            | Public                             |
| `/faq`                    | Frequently asked questions about accounts, projects, verification, payments, and privacy         | Public                             |
| `/privacy`                | Privacy, collection, use, sharing, retention, security, and user-rights details                  | Public                             |
| `/terms`                  | Eligibility, accounts, content, prohibited conduct, payments, disclaimers, and use terms         | Public                             |
| `/dashboard`              | Personalized authenticated dashboard                                                             | Authenticated                      |
| `/projects/manage`        | Project drafts, media, updates, and publication                                                  | Developer/creator capability       |
| `/claims`                 | Claim submission, evidence, owner history, public badges, and appeals                            | Authenticated                      |
| `/claims/:claimId/status` | Redacted public verification status                                                              | Public/optional auth               |
| `/moderation/claims`      | Pending review queue and reviewed audit history                                                  | Moderator capability               |
| `/payments`               | Checkout offers, entitlements, cancellation, history, and receipts                               | Authenticated                      |
| `/creator/earnings`       | Creator revenue, fees, net earnings, and ledger transactions                                     | Creator/KOL capability             |
| `/notifications`          | Inbox, unread state, delivery preferences, and digest settings                                   | Authenticated                      |
| `/admin/users`            | User-role administration                                                                         | Admin capability                   |
| `*`                       | Branded not-found page                                                                           | Public                             |

Azure Static Web Apps is configured to rewrite direct navigation and refreshes to `index.html` while excluding static assets.

## Authentication and platform sessions

### Privy integration

- Added `@privy-io/react-auth` with email and wallet login methods.
- Added a dark Privy appearance configured with the MemeTokenHub accent color.
- Added the root `AuthProvider`, typed authentication context, authentication status union, and platform-user types.
- Added a token exchange call to `POST /api/users/auth/exchange` using the short-lived Privy access token.
- Added abort handling when an exchange effect is superseded or unmounted.
- Added an in-memory platform JWT store; the platform JWT is deliberately not written to local storage.
- Added automatic JWT attachment to API Gateway requests.
- Added JWT clearing on logout and backend `401` responses.

### Authentication states

- Added explicit `loading`, `anonymous`, `exchanging`, `authenticated`, `error`, and `not-configured` states.
- Added a header authentication button that changes from Connect, to loading, to Profile/Sign out, or Retry session.
- Added a reusable `PlatformSessionPanel` for protected routes.
- Corrected the two-stage authentication UX so successful Privy login followed by failed platform-token exchange shows Retry secure session and Sign out rather than another Connect with Privy button.
- Applied the corrected exchange-failure state to Verify and Launch and retained equivalent handling on dashboard, payment, and notification experiences.
- Added capability/role checks in the UI while documenting that backend authorization remains authoritative.

## Shared API Gateway client

- Added `gatewayRequest` as the browser’s single backend transport.
- Reads `VITE_API_BASE_URL` and removes a trailing slash.
- Rejects requests when the Gateway URL is not configured.
- Adds the backend-issued bearer token when present.
- Clears the in-memory token after an unauthorized response.
- Keeps domain-specific DTO parsing and error messages inside each typed service client.

## User Service integration

### Client operations

Implemented typed browser clients for:

- Privy token exchange.
- `GET /api/users/{userId}` public-safe profile retrieval.
- `GET /api/users/me` authenticated profile bootstrap.
- Filtered `GET /api/users/search` people lookup.
- `POST /api/users` account/profile creation.
- `PUT /api/users/{userId}` profile update.
- `DELETE /api/users/{userId}` account deactivation.
- `POST /api/users/{userId}/verify-wallet` wallet proof verification.
- `PUT /api/users/{userId}/role` role assignment.
- Social-channel connect, list, verification, and disconnect routes.

### User experiences

- Added a people directory with query, account-type, verified-only, and network filters.
- Added public profile cards and detailed public profiles.
- Added private account settings for profile data and preferences.
- Added wallet verification UI.
- Added connected social-channel management.
- Added account deactivation handling.
- Added an administration screen for authorized role updates.
- Kept private profile data and proof material out of public profile rendering.
- Prevented the browser administration UI from assigning sensitive moderator authority.

## Token Service integration

### Client operations

Implemented typed clients for:

- Token list/search/filter/sort/pagination.
- Canonical token detail retrieval.
- Project draft creation.
- Project updates.
- Deterministic token feeds.
- Token analytics.
- Creator-owned project lists.
- Supported-network discovery.
- Sentiment windows.
- Project publication.
- Signed project-media upload URLs.
- Direct object-storage upload after client validation.

### Discovery and project details

- Added live Token Service discovery with search and network filters.
- Added debounced server-backed search rather than filtering only local fixtures.
- Added clearly labelled preview fallback data when the Token Service is unavailable.
- Added normalized support for array and paginated `{ items }` responses.
- Added project details composed from canonical project data, analytics, and sentiment windows.
- Kept Social Service writes separate from Token Service reads.

### Project management

- Added developer/creator access checks.
- Added project draft creation and selection.
- Added editable project metadata, contract address, network, category, website, and social links.
- Added HTTPS validation for official websites and social links.
- Added signed logo and banner uploads for PNG, JPEG, and WebP files up to 5 MB.
- Added completion checks before publication.
- Added publication status and user feedback.

## Social Service integration

### Client operations

Implemented typed clients for:

- Legacy follow and unfollow aliases.
- Followers and following lists.
- Personalized feed and user activity.
- Creator and collector leaderboards.
- Reputation and badges.
- Token likes, comments, and engagement.
- General User, Token, and Network follows.
- Current-user tracked targets.
- KOL token support and support withdrawal.
- Token supporter history.
- Replaceable Hot/NotHot votes and vote removal.
- Social post creation, update, deletion, detail, and filtered lists.
- Public and subscriber-labelled post access.

### Social experiences

- Added Community leaderboards and reputation presentation.
- Added My network with tracked targets and personalized feed.
- Added Insights discovery and eligible KOL/developer publishing.
- Added follower/following/reputation/activity composition on public profiles.
- Added token engagement, comments, follows, timestamped KOL support, and Hot/NotHot voting to token details.
- Kept internal `POST /api/social/activities` unavailable to browser code.
- Kept monetization separate from organic votes, support, reputation, and ranking.

## Claim Service integration

### Claim DTO and privacy separation

- Added claim, proof-field, submission, review, appeal, signed-upload, and public-status types.
- Added distinct private owner/moderator and redacted public DTOs.
- Added an explicit public-field allow-list at the client boundary so evidence, attachments, reviewer identity, and review notes are discarded even if accidentally returned by the backend.

### Client operations

Implemented typed clients for:

- `POST /api/claims` claim submission.
- `GET /api/claims/{userId}` owner history.
- `GET /api/claims/pending` moderator queue.
- `PUT /api/claims/{claimId}/review` approve/reject review.
- `GET /api/claims/{claimId}/public-status` redacted public status.
- `GET /api/claims/reviewed` filtered/paginated audit history.
- `POST /api/claims/{claimId}/appeal` one-time appeal.
- `POST /api/claims/attachments/upload-url` signed evidence upload.

### Claim experiences

- Added Project ownership, Social identity, and Official representative claim types.
- Added contract-wallet signature, DNS/site proof, and connected-social proof methods.
- Added private descriptions, proof references, evidence attachment upload, and submission status.
- Added PNG, JPEG, WebP, and PDF evidence validation with a 10 MB limit.
- Added owner claim history and public badge links.
- Added one-time rejected-claim appeal forms with a reason, optional new proof, and optional signed attachments.
- Added a moderator queue with private evidence details, required moderation reason, and approve/reject actions.
- Added reviewed audit filters for status and reviewer.
- Prevented filter controls from issuing a request on every keystroke.
- Added a public verification page that renders only redacted identifiers, status, type, and timestamps.
- Documented that scanning, state transitions, ownership, appeal uniqueness, concurrency, and approval events remain server-owned.

## Payment Service integration

### Client operations

Implemented typed clients for:

- `POST /api/payments/checkout` token checkout.
- `GET /api/payments/{userId}/history` payment history and receipts.
- `POST /api/payments/creator-checkout` subscriptions, tips, and premium posts.
- `GET /api/payments/me/entitlements` current access.
- `DELETE /api/payments/subscriptions/{subscriptionId}` renewal cancellation.
- `GET /api/payments/creators/me/earnings` creator ledger summaries.

The Helio confirmation webhook is intentionally not exposed in browser code.

### Payment experiences and safeguards

- Added token and creator checkout forms.
- Added server-confirmed checkout disclosures for total, currency, platform fee, creator proceeds, renewal terms, and checkout expiry context.
- Added HTTPS validation before rendering provider checkout links.
- Added payment history with status and HTTPS-only receipt links.
- Added webhook-confirmed subscriptions and premium-post entitlements.
- Added renewal cancellation without incorrectly revoking access already paid through expiry.
- Added creator earnings date filters, gross revenue, platform fees, net revenue, and transaction detail.
- Restricted earnings UI to creator/KOL/admin roles or the `payments:earnings` capability.
- Documented and surfaced that checkout callbacks cannot grant access.
- Kept payment activity disconnected from project rank, sentiment, reputation, and verification.

## Notification Service integration

### Client operations

Implemented typed clients for:

- Compatibility `GET /api/notifications/{userId}` inbox access.
- Compatibility `PUT /api/notifications/{userId}/preferences` updates.
- `GET /api/notifications/me` paginated subject-derived inbox.
- `GET /api/notifications/me/preferences` preference retrieval.
- `PUT /api/notifications/me/preferences` preference update.
- `PUT /api/notifications/{notificationId}/read` owned item read state.
- `PUT /api/notifications/read-all` current-user bulk read state.

Internal `POST /api/notifications/send` is intentionally absent from browser code.

### Notification experiences and safeguards

- Added an authenticated notification center.
- Added unread-only filtering and mark-all-read.
- Added accessible per-notification mark-read buttons rather than click-only cards.
- Added global In-app, Email, and Push channel controls.
- Added per-event/per-channel overrides for claims, projects, KOL support, followers, posts, vote milestones, subscriptions, and payments.
- Added Immediate, Daily, Weekly, and Off digest preferences.
- Split inbox and preference loading so changing the unread filter cannot overwrite unsaved preference edits.
- Ignored stale async results after the relevant effect is cleaned up.
- Supported `204 No Content` read responses and updated owned read state locally.
- Restricted action links to local, non-protocol-relative application paths.
- Documented event-driven delivery and the immediate application of opt-outs.

## Company, legal, and help pages

- Replaced the former About alias to the Learn page with a dedicated About us experience.
- Added a mission statement explaining MemeTokenHub’s focus on context, provenance, private verification, transparent creator monetization, and separation of paid activity from organic signals.
- Added an illustrated four-step explanation of discovery, authentication, participation, and independent decision-making.
- Added a detailed Privacy Policy with an effective date and sections for scope, collected information, payment data, uses, sharing, cookies, retention, security, user choices and rights, international processing, children, updates, and contact.
- Added detailed Terms of Use covering acceptance, eligibility, account security, user content licensing, moderation, prohibited behavior, project/verification limitations, creator payments, intellectual property, third parties, disclaimers, liability, termination, general provisions, and contact.
- Added a grouped FAQ using accessible native disclosure controls for getting started, projects/community, verification, payments, notifications, and privacy.
- Added explicit reminders that the platform is not an exchange, wallet, broker, or investment adviser and that badges and community signals are not guarantees.
- Added cross-navigation between About, FAQ, Privacy Policy, and Terms of Use.
- Added footer links to all four informational pages.
- Added responsive desktop, tablet, and mobile layouts for legal summaries, long-form policy content, values, process steps, FAQ disclosures, and support calls to action.
- Added route tests for every informational page and footer-link assertions.

## Local preview data and assets

- Added typed local meme-token and community-leader fixtures for usable preview states.
- Added preview market statistics, token art, mascots, network labels, and sentiment examples.
- Added `public/favicon.svg` and the shared `public/icons.svg` sprite.
- Added the SPA `index.html` with metadata, theme color, favicon, root element, and module entry.
- Added explicit preview/fallback labels to distinguish fixtures from live service data.

## Testing

### Test infrastructure

- Added Vitest through the Vite configuration.
- Added jsdom for browser-like component tests.
- Added Testing Library, user-event, and jest-dom matchers.
- Added a global test setup file.
- Added cleanup of rendered views, mocked environment variables, mocked fetch calls, and the in-memory JWT after tests.

### Covered behavior

The 27-test suite covers:

1. Main discovery rendering.
2. Server-backed token search filtering.
3. Token detail routing.
4. Follow-to-sign-in dashboard routing.
5. The documented Privy token exchange request.
6. Header retry behavior after exchange failure.
7. Verify and Launch exchange-failure behavior without a duplicate Privy login.
8. Public user-search query construction.
9. Platform-JWT attachment to profile, wallet, and role writes.
10. Token discovery, feed, creator, and sentiment request construction.
11. Authenticated token draft, update, publication, and media URL writes.
12. Paginated token-list normalization and clean empty-query URLs.
13. Unsupported and oversized project-media rejection.
14. Social feed, tracked-target, supporter, vote, and post read requests.
15. Authenticated follow, support, vote, and post writes.
16. All Claim Service reads and state transitions.
17. Claim evidence type and size validation.
18. Public claim DTO and rendered evidence redaction.
19. All browser-facing Payment Service requests and webhook exclusion.
20. Unsafe payment-provider checkout URL rejection.
21. Subject-derived and compatibility Notification Service requests with internal send exclusion.
22. Notification preference stability when unread filtering changes.
23. Dedicated About us page routing and legal/company footer navigation.
24. FAQ page routing and legal/company footer navigation.
25. Privacy Policy routing and legal/company footer navigation.
26. Terms of Use routing and legal/company footer navigation.
27. Page-top restoration when footer navigation changes the client-side route.

## Tooling and build configuration

### Package and scripts

- Added `package.json` with React 19, React DOM, React Router, Privy, Solana peer packages, Lucide, and date utilities.
- Added TypeScript, Vite, Tailwind Vite integration, Oxlint, Prettier, Vitest, coverage, jsdom, and Testing Library development dependencies.
- Added scripts for development, build, production preview, lint, test, coverage, formatting, and format checking.
- Added `package-lock.json` for deterministic `npm ci` installs.

### TypeScript and Vite

- Added the root TypeScript project references.
- Added separate application and Node/tooling TypeScript configurations.
- Enabled strict application type checking and modern browser libraries.
- Added the React and Tailwind Vite plugins.
- Added jsdom-backed Vitest configuration and setup loading.

### Linting and formatting

- Added Oxlint configuration with TypeScript and React rules.
- Configured the lint script to deny warnings.
- Added Prettier and `.prettierignore` entries for dependencies, builds, coverage, and generated artifacts.
- Added ignore entries for local dependencies, build output, environment overrides, coverage, Vite cache, and visual-review artifacts.

## Environment configuration

Added `.env.example` with:

- `VITE_API_BASE_URL` — the browser-facing API Gateway origin.
- `VITE_PRIVY_APP_ID` — the public Privy application identifier.
- `VITE_HELIO_PAYSTREAM_ID` — the public Helio checkout configuration identifier.

Only `VITE_` variables are intended for browser exposure. Deployment secrets, provider webhook secrets, signing keys, and backend credentials must never be stored in these variables.

## CI/CD

### Pull-request workflow

Added `.github/workflows/pull-request.yml`:

- Triggers exclusively on `pull_request`.
- Uses read-only repository-content permissions.
- Checks out the repository and documentation submodule recursively.
- Uses Node.js 22 with npm caching.
- Runs `npm ci`.
- Runs `npm run lint`.
- Runs `npm test`.
- Runs `npm run build`.
- Contains no publish or deployment step.

### Main workflow

Added `.github/workflows/main.yml`:

- Triggers on pushes to `main`.
- Supports manual `workflow_dispatch` deployment.
- Uses read-only repository-content permissions.
- Uses concurrency cancellation for superseded runs on the same ref.
- Checks out submodules recursively.
- Uses Node.js 22 and npm caching.
- Installs locked dependencies, lints, tests, and builds.
- Supplies public Vite configuration from GitHub repository variables during the build.
- Deploys the prebuilt `dist` directory with `Azure/static-web-apps-deploy@v1`.
- Uses `secrets.AZURE_STATIC_WEB_APPS_API_TOKEN` for deployment authorization.
- Sets `skip_app_build: true` because the production bundle has already been verified.

## Azure Static Web Apps configuration

- Added SPA navigation fallback to `/index.html`.
- Excluded compiled and static asset extensions from fallback rewriting.
- Added `X-Content-Type-Options: nosniff`.
- Added `Referrer-Policy: strict-origin-when-cross-origin`.
- Added a restrictive Permissions Policy for camera, microphone, and geolocation.
- Added an explicit JSON MIME type.

## Documentation

### README

Replaced the placeholder README with documentation for:

- Product purpose and highlights.
- How the application works.
- Global desktop and mobile navigation.
- A recommended first-time user journey.
- Goal-based navigation.
- Access by visitor/member/developer/creator/KOL/moderator/admin role.
- All 22 named application routes.
- Installation and available scripts.
- Environment variables and Privy token exchange.
- User, Token, Social, Claim, Payment, and Notification Service feature coverage.
- CI/CD and Azure deployment setup.
- Architecture and trust boundaries.
- Nested dependency deprecation notices from Privy’s wallet stack.
- Azure Static Web Apps routing behavior.

### Source specifications

- Added `.gitmodules` and the `docs/mth-docs` submodule.
- Preserved the product overview, frontend instructions, backend service contracts, architecture diagrams, and integration guidance as the implementation source of truth.
- Configured CI checkout to initialize the submodule recursively.

## Security and trust boundaries

- The API Gateway is the only browser-facing backend origin.
- Platform JWTs are held only in memory.
- `401` responses clear the current platform token.
- Privy login and platform authorization remain separate stages.
- Role and capability checks are mirrored in the UI but enforced by backend services.
- Private claim evidence and moderator notes never appear in public claim DTOs or pages.
- Signed uploads validate file type and size before obtaining an upload URL.
- Uploaded files are sent directly to approved object storage rather than proxied through frontend state.
- Checkout and receipt links require HTTPS.
- Notification action links must be local app paths.
- Helio webhooks and internal notification delivery endpoints are excluded from browser clients.
- Checkout return navigation cannot grant an entitlement.
- Payment, sponsorship, and premium access cannot influence organic ranks, votes, support, sentiment, reputation, or verification.
- Backend services remain authoritative for moderation transitions, payment confirmation, entitlements, counts, and event-driven notifications.

## Review follow-up corrections included in this PR

The PR includes the following review-driven corrections in addition to the initial implementation:

- Replaced the incorrect Connect button after a failed Privy-to-platform exchange with Retry session behavior.
- Applied exchange-failure handling consistently to Verify and Launch.
- Moved token discovery filtering to Token Service queries and retained explicit preview fallback behavior.
- Normalized paginated token responses and removed unnecessary empty query suffixes.
- Added project publication prerequisites and HTTPS social-link checks.
- Added media type/size validation before signed uploads.
- Completed all documented User, Token, Social, Claim, Payment, and Notification browser endpoints.
- Ensured the browser does not expose internal-only Social activity, Payment webhook, or Notification send endpoints.
- Added public claim allow-list redaction at the client boundary.
- Added complete appeal proof and evidence support.
- Prevented moderator audit filters from fetching on every field edit.
- Preserved active paid access when subscription renewal is cancelled.
- Prevented unread inbox filtering from resetting notification preference edits.
- Supported empty successful notification read responses.
- Replaced inaccessible click-only notification cards with explicit read buttons.
- Rejected unsafe checkout, receipt, and notification action URLs.
- Expanded README navigation and role guidance and verified that every implemented route is documented.

## File-level inventory

### Repository and automation

- `.env.example` — public local-development configuration template.
- `.github/workflows/main.yml` — verified main build and Azure deployment.
- `.github/workflows/pull-request.yml` — PR-only lint/test/build verification.
- `.gitignore` — local dependency, output, environment, coverage, cache, and artifact exclusions.
- `.gitmodules` — documentation submodule registration.
- `.oxlintrc.json` — TypeScript/React lint rules.
- `.prettierignore` — formatter exclusions.
- `README.md` — user, developer, architecture, service, route, and deployment guide.
- `changelog-pr1.md` — this cumulative PR changelog.
- `package.json` / `package-lock.json` — runtime and development dependencies plus deterministic resolution.
- `staticwebapp.config.json` — Azure SPA fallback and security headers.
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — TypeScript project configuration.
- `vite.config.ts` — React/Tailwind build and Vitest configuration.

### Public application files

- `index.html` — HTML entry and application metadata.
- `public/favicon.svg` — application favicon.
- `public/icons.svg` — reusable icon artwork.

### Application foundation

- `src/main.tsx` — React root, router, authentication provider, and global CSS entry.
- `src/App.tsx` — global shell and route table.
- `src/index.css` — complete responsive dark design system.
- `src/types.ts` — shared UI-facing token and community types.
- `src/data/mockData.ts` — clearly labelled preview/fallback data.

### Authentication

- `src/auth/AuthProvider.tsx` — Privy and platform-token lifecycle.
- `src/auth/authContext.ts` — typed authentication context and hook.
- `src/auth/authTypes.ts` — platform user, profile, preference, and auth-state types.
- `src/auth/platformTokenStore.ts` — in-memory JWT storage.

### Components

- `src/components/AppHeader.tsx` — market bar, desktop/mobile navigation, and account actions.
- `src/components/AuthButton.tsx` — authentication status control.
- `src/components/Footer.tsx` — global footer and shortcuts.
- `src/components/PlatformSessionPanel.tsx` — shared protected-route session states.
- `src/components/ScrollToTop.tsx` — page-top and fragment scroll restoration after client-side navigation.
- `src/components/TokenCard.tsx` — discovery project card.
- `src/components/TokenSocialPanel.tsx` — token engagement, follows, support, comments, and votes.

### Pages

- `src/pages/DiscoverPage.tsx` — project search, network filters, feeds, preview fallback, and home content.
- `src/pages/SupportingPages.tsx` — project details, dashboard, Learn, community support, and not-found content.
- `src/pages/InformationPages.tsx` — About us, FAQ, Privacy Policy, and Terms of Use.
- `src/pages/UserPages.tsx` — people, public profiles, private profile settings, social/wallet management, and role admin.
- `src/pages/ProjectManagementPage.tsx` — project draft, media, update, and publication studio.
- `src/pages/SocialPages.tsx` — Community, My network, and Insights experiences.
- `src/pages/ClaimPages.tsx` — claim center, moderation workspace, and public claim status.
- `src/pages/PaymentPages.tsx` — payments/access and creator earnings.
- `src/pages/NotificationPage.tsx` — inbox, unread state, and notification preferences.

### Services

- `src/services/gatewayClient.ts` — shared authenticated Gateway transport.
- `src/services/userService.ts` — User Service contract.
- `src/services/tokenService.ts` — Token Service contract and media uploads.
- `src/services/socialService.ts` — Social Service contract.
- `src/services/claimService.ts` — Claim Service contract and evidence uploads.
- `src/services/paymentService.ts` — Payment Service contract and checkout validation.
- `src/services/notificationService.ts` — Notification Service contract.

### Tests

- `src/App.test.tsx` — application, authentication, service-contract, validation, security, and regression tests.
- `src/test/setup.ts` — Testing Library DOM matchers.

## Operational notes

- Run `npm ci` rather than `npm install` in CI to use the committed lockfile exactly.
- Configure `VITE_API_BASE_URL` and `VITE_PRIVY_APP_ID` for authenticated service integration.
- Configure `VITE_HELIO_PAYSTREAM_ID` only as public checkout configuration; provider secrets remain server-side.
- Configure the GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN` before main-branch deployment.
- Configure the three public Vite values as GitHub repository variables because Vite embeds them during build time.
- Initialize `docs/mth-docs` when cloning with submodules if the architecture documentation is required locally.
- npm may report deprecation notices from transitive packages in Privy’s wallet-connection dependency graph. These are not direct application dependencies and should be addressed through future supported Privy upgrades rather than unsafe dependency overrides.
- The production build currently emits a Vite large-chunk advisory primarily because of Privy’s wallet/authentication bundle. It is a build warning rather than a compilation failure.
