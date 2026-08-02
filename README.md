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

| Command                 | Purpose                                                |
| ----------------------- | ------------------------------------------------------ |
| `npm run dev`           | Start the Vite development server.                     |
| `npm run build`         | Type-check and create an optimized production build.   |
| `npm run preview`       | Preview the production build locally.                  |
| `npm run lint`          | Run static analysis with warnings treated as failures. |
| `npm test`              | Run the test suite once.                               |
| `npm run test:coverage` | Run tests and generate coverage output.                |
| `npm run format`        | Format supported project files.                        |
| `npm run format:check`  | Check formatting without changing files.               |

## Routes

| Route             | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `/`               | Public token discovery, search, filters, community voices, and trust overview. |
| `/token/:tokenId` | Project identity, price context, and organic sentiment.                        |
| `/community`      | Verified community voices.                                                     |
| `/learn`          | Verification and organic-discovery trust center.                               |
| `/dashboard`      | Preview of the protected personalized experience.                              |

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
