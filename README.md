# MemeTokenHub Frontend

A modern, responsive React single-page application for discovering meme-token projects, following community voices, understanding organic sentiment, and exploring verified project identities.

## Highlights

- Responsive discovery experience for mobile, tablet, and desktop.
- Search and network filters for token projects.
- Project detail, community, trust center, and dashboard-preview routes.
- Accessible navigation, semantic content, keyboard-friendly controls, and reduced-motion support.
- Dark, crypto-native design system with layered market surfaces, vibrant gradients, expressive token artwork, and organic-signal storytelling.
- Azure Static Web Apps deployment and pull-request verification workflows.

The current UI uses clearly labelled local sample data while backend services are being provisioned. Market figures are illustrative and must not be presented as live data. The application is structured so the documented API Gateway, Privy token exchange, and Helio checkout can be connected without making the browser authoritative for verification or payment status.

## How the application works

MemeTokenHub brings project discovery, community activity, creator content, identity verification, and creator monetization into one responsive single-page application:

1. **Public discovery** — visitors can browse projects, search by name or symbol, filter by network, inspect project details, review community sentiment, find people, and read educational content without signing in.
2. **Privy authentication** — protected actions start with Privy's email or wallet login. After Privy succeeds, the browser exchanges the short-lived Privy access token for a MemeTokenHub platform JWT through the API Gateway.
3. **Platform authorization** — the platform JWT identifies the user and carries their role and capabilities. Pages such as project launch, moderation, role administration, and creator earnings show only the controls appropriate to that account; backend services still enforce every authorization rule.
4. **Domain services through the Gateway** — typed frontend clients call the User, Token, Social, Claim, Payment, and Notification services through `VITE_API_BASE_URL`. The browser never connects directly to a service database.
5. **Server-authoritative outcomes** — optimistic UI improves responsiveness, but the backend remains authoritative for votes, follower counts, verification, moderation, payment confirmation, entitlements, and notifications. Returning from checkout does not unlock content until Payment Service confirms the provider webhook.

The platform JWT is kept in memory rather than local storage. Refreshing the page asks Privy for the current session and performs the exchange again. If Privy login succeeds but the exchange fails, protected pages show **Retry secure session** and **Sign out** instead of asking the user to connect to Privy a second time.

## Navigating the application

### Global navigation

The header is available on every page:

- Select the **MemeTokenHub** logo to return to Discover.
- Use **Discover**, **Community**, **Insights**, **People**, **Launch**, **Verify**, and **Learn** on desktop.
- Select the menu icon on mobile or narrow tablets to open the same primary links.
- Select the bell icon to open the notification center.
- Select **Watchlist** to open the personalized dashboard.
- Select **Connect** to sign in with Privy. Once authenticated, the same area links to the user's profile and provides a sign-out button.
- Use the footer shortcuts to open notifications, payments and access, verification, safety information, and the main public areas.
- Use the **Company** footer links to read About us, FAQ, Privacy policy, Terms of use, and contact information.

Role-specific destinations such as My network, creator earnings, moderation, and user administration are not part of the primary header. Their direct routes are listed in the goal and route tables below; the backend still checks the signed-in account before returning protected data.

### Recommended first-time journey

1. Start on **Discover** and search for a project or choose a network filter.
2. Open a project card to view its canonical profile, analytics, organic sentiment, supporters, comments, and community votes.
3. Visit **People** or **Community** to find creators and public profiles.
4. Select **Connect** when you want to follow, publish, verify a relationship, manage payments, or personalize notifications.
5. After signing in, use **Watchlist** and open `/network` to revisit tracked projects, creators, and activity.

### Navigation by goal

| Goal                          | Where to go                                  | What the user can do                                                                                         |
| ----------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Find meme-token projects      | **Discover** (`/`)                           | Search, filter by network, review trending projects, and open project pages.                                 |
| Inspect a project             | `/token/:tokenId`                            | View project identity, analytics, sentiment windows, comments, support, and Hot/NotHot voting.               |
| Find community members        | **People** (`/people`)                       | Search public-safe profiles by name, account type, verification, and network.                                |
| Explore community leaders     | **Community** (`/community`)                 | View reputation leaderboards and established community voices.                                               |
| Read or publish insights      | **Insights** (`/insights`)                   | Browse posts; eligible KOLs and developers can publish public or subscriber-labelled content.                |
| Review followed activity      | `/network`                                   | View the authenticated user's tracked users, tokens, networks, and personalized activity feed.               |
| Manage a profile              | Profile button → `/profile`                  | Update the private account profile, wallet verification, and connected social channels.                      |
| Launch a project              | **Launch** (`/projects/manage`)              | Developers and creators can create drafts, upload media, edit project data, and publish completed projects.  |
| Verify a project relationship | **Verify** (`/claims`)                       | Submit ownership, social-identity, or representative evidence; review history and appeal a rejection.        |
| View a public verification    | `/claims/:claimId/status`                    | View the redacted public status without exposing evidence or moderator notes.                                |
| Review claims                 | `/moderation/claims`                         | Moderators can inspect private evidence, approve or reject claims, and search audit history.                 |
| Manage purchases and access   | Footer → **Payments & access** (`/payments`) | Review checkout terms, open secure provider checkout, inspect receipts and entitlements, and cancel renewal. |
| Review creator revenue        | `/creator/earnings`                          | Eligible creators can filter ledger-backed gross revenue, fees, net earnings, and transactions.              |
| Manage alerts                 | Bell icon → `/notifications`                 | Filter unread notifications, mark items read, and configure channel, event, and digest preferences.          |
| Learn about trust and safety  | **Learn** (`/learn`)                         | Understand verification, organic trends, provenance, and platform safety boundaries.                         |

### Access by account type

- **Visitors** can use discovery, project details, public profiles, community pages, public insights, public verification status, and the trust center.
- **Authenticated members** can manage their profile, network, notifications, payments, claim submissions, follows, comments, and votes.
- **Developers and creators** can receive project-writing capabilities for Launch.
- **KOLs and creators** can publish eligible insights and access their private earnings dashboard.
- **Moderators** can access claim review when their JWT includes the `claims:review` capability or moderator role.
- **Administrators** can access user-role administration at `/admin/users`; sensitive roles remain backend-controlled.

If a user opens a protected page before signing in, the page explains why authentication is required. If the account lacks the required role or capability after authentication, the page displays an access-required message rather than rendering unauthorized controls.

## Technology

- React 19 with TypeScript
- Vite
- React Router
- Tailwind CSS 4 through the official Vite plugin
- Lucide React icons
- Vitest and Testing Library
- Oxlint and Prettier

## Getting started

### Prerequisites

- Node.js 22.12 or newer
- npm 10 or newer

### Installation

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Vite prints the local development URL, normally `http://localhost:5173`.

## Available scripts

| Command                      | Purpose                                                 |
| ---------------------------- | ------------------------------------------------------- |
| `npm run dev`                | Start the Vite development server.                      |
| `npm run build`              | Type-check and create an optimized production build.    |
| `npm run preview`            | Preview the production build locally.                   |
| `npm run lint`               | Run static analysis with warnings treated as failures.  |
| `npm test`                   | Run the test suite once.                                |
| `npm run test:e2e`           | Run the Playwright browser tests in Chromium.           |
| `npm run screenshots`        | Capture desktop and mobile screenshots with Playwright. |
| `npm run test:coverage`      | Run tests and generate coverage output.                 |
| `npm run playwright:install` | Install Chromium and its required OS packages.          |
| `npm run format`             | Format supported project files.                         |
| `npm run format:check`       | Check formatting without changing files.                |

### Browser testing with Playwright

Playwright and its Chromium browser target are included as development tooling. On a new
machine or CI runner, install the browser binary and Linux system dependencies once:

```bash
npm run playwright:install
```

Then run the end-to-end smoke tests. Playwright automatically starts the Vite development
server on port `4173` for the duration of the test run:

```bash
npm run test:e2e
```

To create full-page visual-review screenshots for the discovery and About pages, run:

```bash
npm run screenshots
```

The PNG files are written to `artifacts/screenshots/`, which is intentionally ignored by
Git because the images are local review output.

## Routes

| Route                     | Description                                                                    |
| ------------------------- | ------------------------------------------------------------------------------ |
| `/`                       | Public token discovery, search, filters, community voices, and trust overview. |
| `/token/:tokenId`         | Project identity, price context, and organic sentiment.                        |
| `/community`              | Community reputation leaderboards and verified voices.                         |
| `/network`                | Protected tracked targets and personalized social activity.                    |
| `/insights`               | Public content discovery and eligible creator/KOL publishing.                  |
| `/people`                 | Public-safe user search and profile discovery.                                 |
| `/profile`                | Protected profile, wallet, social-channel, and account settings.               |
| `/profile/:userId`        | Public-safe user profile and social context.                                   |
| `/learn`                  | Verification and organic-discovery trust center.                               |
| `/about`                  | Product mission and trust information.                                         |
| `/faq`                    | Answers about accounts, projects, verification, payments, and privacy.         |
| `/privacy`                | Detailed privacy, data-use, sharing, retention, and user-rights policy.        |
| `/terms`                  | Detailed account, content, conduct, payment, and platform-use terms.           |
| `/dashboard`              | Protected personalized experience.                                             |
| `/projects/manage`        | Capability-gated project creation, media, editing, and publication.            |
| `/claims`                 | Private claim submission, history, evidence uploads, and appeals.              |
| `/claims/:claimId/status` | Public, redacted claim-verification status.                                    |
| `/moderation/claims`      | Capability-gated claim review and audit history.                               |
| `/notifications`          | Subject-derived inbox, read state, channel controls, and digest preferences.   |
| `/payments`               | Checkout disclosures, entitlements, renewal cancellation, and receipts.        |
| `/creator/earnings`       | Private creator revenue, fee, and transaction summaries.                       |
| `/admin/users`            | Capability-gated user-role administration.                                     |

Unknown routes display a branded not-found page.

## Environment configuration

Copy `.env.example` to `.env.local`. Only variables prefixed with `VITE_` are exposed to browser code; never place deployment tokens, webhook secrets, or backend credentials in these variables.

| Variable                  | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| `VITE_API_BASE_URL`       | API Gateway origin used by future typed domain clients. |
| `VITE_PRIVY_APP_ID`       | Public Privy application identifier.                    |
| `VITE_HELIO_PAYSTREAM_ID` | Public Helio checkout configuration identifier.         |

### Privy token exchange

When `VITE_PRIVY_APP_ID` is configured, the root `AuthProvider` opens Privy's email or wallet login flow. After Privy authenticates the visitor, the frontend retrieves the short-lived Privy access token and sends `{ "privyToken": "..." }` to `POST /api/users/auth/exchange` at `VITE_API_BASE_URL`. The resulting MemeTokenHub JWT is held in memory—not local storage—and is attached as a bearer token by the shared Gateway client. Signing out and backend `401` responses clear that token.

The exchange response must have this shape:

```json
{
  "jwtToken": "backend-issued-jwt",
  "user": {
    "userId": "platform-user-id",
    "username": "optional-display-name",
    "role": "AuthenticatedUser"
  }
}
```

### User Service feature coverage

The frontend includes typed User Service clients and user-facing flows for the remaining documented endpoints:

| Capability                                            | Endpoint / route                                |
| ----------------------------------------------------- | ----------------------------------------------- |
| Public profile                                        | `GET /api/users/{userId}` → `/profile/:userId`  |
| Private profile bootstrap                             | `GET /api/users/me` → `/profile`                |
| Create and update profile                             | `POST /api/users`, `PUT /api/users/{userId}`    |
| Account deactivation                                  | `DELETE /api/users/{userId}`                    |
| Filtered people search                                | `GET /api/users/search` → `/people`             |
| Wallet verification                                   | `POST /api/users/{userId}/verify-wallet`        |
| Admin role assignment                                 | `PUT /api/users/{userId}/role` → `/admin/users` |
| Connect, list, verify, and disconnect social channels | `/api/users/{userId}/social-channels/*`         |

Private profile fields and wallet/provider proofs are never rendered in the public profile page. Role administration is capability-gated in the UI and intentionally excludes assigning `Moderator`; the backend remains authoritative for ownership and authorization on every protected request.

### Token Service feature coverage

The Token Service client covers list/search/filter/sort/pagination, details, deterministic feeds, analytics, creator projects, supported networks, sentiment windows, project draft creation and updates, signed media uploads, and publication. Public discovery and token details use live API data when the Gateway is configured and retain clearly labelled preview data when it is unavailable.

Developers with `projects:write` can use `/projects/manage` to create and edit drafts, upload validated logo/banner types through signed URLs, and publish completed project homes. Signed upload responses are sent directly to approved object storage; the browser persists only the returned asset URL. The `/token/:tokenId` experience composes canonical detail, analytics, and transparent sentiment reads without mutating Social Service votes or follows.

### Social Service feature coverage

The Social Service client implements legacy user follow aliases, followers/following, personalized and public activity feeds, creator/collector leaderboards, reputation, token likes/comments/engagement, generalized User/Token/Network follows, timestamped KOL support and withdrawal, replaceable Hot/NotHot votes, and public/subscriber-labelled post CRUD and feeds.

Token detail pages use Social Service—not Token Service—for community writes. `/community` displays reputation leaderboards, `/network` displays the authenticated user's tracked targets and personalized feed, `/insights` provides content discovery and KOL/developer publishing, and public profile pages compose follower, following, reputation, and activity reads. The internal-only `POST /api/social/activities` endpoint is intentionally not exposed to browser code.

### Claim Service feature coverage

The Claim Service client covers private claim submission and owner history, moderator pending and reviewed queues, approve/reject decisions with required notes, one-time rejected-claim appeals, public redacted status, and restricted signed evidence uploads. The browser accepts only PNG, JPEG, WebP, and PDF evidence up to 10 MB, uploads it directly to signed storage, and stores only the returned object reference.

Authenticated users can use `/claims` for `ProjectOwnership`, `SocialIdentity`, and `OfficialRepresentative` verification workflows. Moderators with the `claims:review` capability use `/moderation/claims`; `/claims/:claimId/status` is the optional-auth public badge surface and intentionally cannot render proof fields, attachments, reviewer identity, or reviewer notes. Backend state transitions, claimant/project validation, evidence scanning, appeal uniqueness, concurrency, and approval events remain authoritative in Claim Service.

### Payment Service feature coverage

The Payment Service client covers token and creator checkout sessions, owner payment history and receipts, creator subscriptions/tips/premium posts, entitlement filtering, subscription-renewal cancellation, and paginated creator earnings. `/payments` discloses the server-confirmed total, currency, fees, creator share, and renewal terms before linking to Helio; `/creator/earnings` is restricted to creator/KOL roles or `payments:earnings` capability.

Checkout return URLs never grant access in the browser. Subscriptions and premium-post access appear only through webhook-confirmed `/me/entitlements` results. The Helio `/confirm` webhook is deliberately absent from frontend code, amounts are treated as offer requests rather than trusted prices, and monetization is not connected to rankings, sentiment, reputation, or verification.

### Notification Service feature coverage

`/notifications` uses the subject-derived inbox and preference routes with unread filtering, individual/read-all actions, global channel controls, per-event/per-channel settings, and immediate/daily/weekly/off digest frequency. Compatibility user-ID methods remain available for older callers while backend ownership checks remain authoritative.

The internal `/api/notifications/send` endpoint is deliberately absent from the browser client. Notifications are displayed only after the service consumes source events, applies preferences, and creates inbox records; the frontend does not trigger delivery or synchronously couple producer requests to Notification Service availability.

## Continuous integration and deployment

### Main deployment

`.github/workflows/main.yml` runs for pushes to `main` and manual `workflow_dispatch` requests. It installs locked dependencies, lints, tests, builds, and deploys the prebuilt `dist` directory to Azure Static Web Apps.

Create this GitHub Actions repository secret before deploying:

- `AZURE_STATIC_WEB_APPS_API_TOKEN` — deployment token supplied by Azure Static Web Apps.

Also create repository variables named `VITE_API_BASE_URL`, `VITE_PRIVY_APP_ID`, and, when checkout is enabled, `VITE_HELIO_PAYSTREAM_ID`. Vite embeds these public configuration values during the production build; adding them only to the Static Web App runtime configuration will not update an already-built SPA.

### Pull requests

`.github/workflows/pull-request.yml` runs exclusively for `pull_request` events. It installs dependencies, lints, tests, and builds, with no publishing or deployment step.

## Architecture notes

- Public routes remain usable without authentication.
- Protected features will exchange the Privy identity token for a platform JWT before calling backend services.
- The API Gateway remains the only browser-facing backend origin.
- Client callbacks and optimistic UI must never be treated as proof of a payment, claim approval, or organic count.
- Sponsorship must stay visibly separate from votes, support, reputation, and organic trends.

The full product and integration specifications are available in the `docs/mth-docs` submodule.

## Dependency notices

The application directly depends on maintained packages, including the current `@privy-io/react-auth` release. Some versions of npm print deprecation notices for packages nested under Privy's wallet-connection stack—primarily `x402`, Wagmi connectors, MetaMask SDK, Safe SDK, WalletConnect, and their older `uuid`/QR dependencies. They are not direct MemeTokenHub dependencies and cannot be replaced from this repository without overriding Privy's tested dependency graph.

Use `npm explain <package-name>` to verify ownership of a notice. Do not add `uuid`, `qr`, MetaMask, Safe, or WalletConnect packages directly merely to suppress npm output; doing so does not replace the nested copy and can create an unsupported authentication bundle. These notices should be resolved by upgrading `@privy-io/react-auth` when Privy publishes a dependency refresh.

The Solana packages listed directly in `package.json` are optional Privy peer dependencies required by the current Vite bundler to resolve Privy's exported wallet modules. The unused Abstract, Farcaster, and `permissionless` optional peers are intentionally omitted to keep the installation smaller.

## Azure Static Web Apps

`staticwebapp.config.json` configures SPA navigation fallback and baseline security headers. React Router routes therefore continue to work when loaded directly or refreshed in Azure.
