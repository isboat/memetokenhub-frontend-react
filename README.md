# MemeTokenHub Frontend

A modern, responsive React single-page application for discovering meme-token projects, following community voices, understanding organic sentiment, and exploring verified project identities.

## Highlights

- Responsive discovery experience for mobile, tablet, and desktop.
- Search and network filters for token projects.
- Project detail, community, trust center, and dashboard-preview routes.
- Accessible navigation, semantic content, keyboard-friendly controls, and reduced-motion support.
- Dark, crypto-native design system with layered market surfaces, vibrant gradients, expressive token artwork, and organic-signal storytelling.
- Azure Static Web Apps deployment and pull-request verification workflows.

The current UI uses realistic local sample data while backend services are being provisioned. It is structured so the documented API Gateway, Privy token exchange, and Helio checkout can be connected without making the browser authoritative for verification or payment status.

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

- Node.js 22 or newer
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

## Continuous integration and deployment

### Main deployment

`.github/workflows/main.yml` runs for pushes to `main` and manual `workflow_dispatch` requests. It installs locked dependencies, lints, tests, builds, and deploys the prebuilt `dist` directory to Azure Static Web Apps.

Create this GitHub Actions repository secret before deploying:

- `AZURE_STATIC_WEB_APPS_API_TOKEN` — deployment token supplied by Azure Static Web Apps.

### Pull requests

`.github/workflows/pull-request.yml` runs exclusively for `pull_request` events. It installs dependencies, lints, tests, and builds, with no publishing or deployment step.

## Architecture notes

- Public routes remain usable without authentication.
- Protected features will exchange the Privy identity token for a platform JWT before calling backend services.
- The API Gateway remains the only browser-facing backend origin.
- Client callbacks and optimistic UI must never be treated as proof of a payment, claim approval, or organic count.
- Sponsorship must stay visibly separate from votes, support, reputation, and organic trends.

The full product and integration specifications are available in the `docs/mth-docs` submodule.

## Azure Static Web Apps

`staticwebapp.config.json` configures SPA navigation fallback and baseline security headers. React Router routes therefore continue to work when loaded directly or refreshed in Azure.
