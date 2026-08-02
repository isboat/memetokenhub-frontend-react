import {
  BadgeCheck,
  BookOpenCheck,
  CircleHelp,
  Eye,
  FileText,
  HeartHandshake,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const effectiveDate = "August 2, 2026";

function InformationHero({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <header className="information-hero">
      <span className="eyebrow purple">
        {icon} {eyebrow}
      </span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

function PolicyNavigation() {
  return (
    <nav className="policy-navigation" aria-label="Legal and company pages">
      <Link to="/about">About us</Link>
      <Link to="/faq">FAQ</Link>
      <Link to="/privacy">Privacy policy</Link>
      <Link to="/terms">Terms of use</Link>
    </nav>
  );
}

export function PrivacyPolicyPage() {
  return (
    <main className="information-page page-shell">
      <InformationHero
        eyebrow="Privacy policy"
        title="Your privacy deserves plain language."
        description="This policy explains what MemeTokenHub collects, why we use it, when it may be shared, and the choices available to you."
        icon={<LockKeyhole size={14} />}
      />
      <PolicyNavigation />
      <div className="policy-layout">
        <aside className="policy-summary">
          <ShieldCheck />
          <h2>Privacy at a glance</h2>
          <ul>
            <li>
              Platform access uses Privy and a separate MemeTokenHub session.
            </li>
            <li>Private claim evidence is not shown on public pages.</li>
            <li>
              Payment confirmation and sensitive provider data stay server-side.
            </li>
            <li>You can manage profile visibility and notification choices.</li>
          </ul>
          <p>Effective {effectiveDate}</p>
        </aside>
        <article className="policy-content">
          <section>
            <h2>1. Scope</h2>
            <p>
              This Privacy Policy applies to the MemeTokenHub website, web
              application, and related services that link to it. It does not
              govern third-party wallets, blockchains, social networks, payment
              providers, or websites, which operate under their own policies.
            </p>
          </section>
          <section>
            <h2>2. Information we collect</h2>
            <h3>Information you provide</h3>
            <ul>
              <li>
                Profile details such as username, display name, biography,
                avatar, and optional social links.
              </li>
              <li>
                Email, wallet, or other identifiers used through Privy to
                authenticate you.
              </li>
              <li>
                Project information, posts, comments, votes, follows, support
                statements, and other content you submit.
              </li>
              <li>
                Private claim descriptions, proof references, and evidence
                attachments submitted for verification.
              </li>
              <li>
                Notification settings, support requests, and communications with
                us.
              </li>
            </ul>
            <h3>Information collected automatically</h3>
            <ul>
              <li>
                Device, browser, language, approximate region, IP address, and
                diagnostic logs.
              </li>
              <li>
                Pages viewed, buttons used, referral information, session
                timing, and performance or error events.
              </li>
              <li>
                Public blockchain information associated with a wallet address
                or transaction you choose to provide.
              </li>
            </ul>
            <h3>Payments</h3>
            <p>
              Payment Service records checkout purpose, amount, currency,
              status, fees, entitlement, receipt reference, and provider
              transaction identifiers. Payment credentials and signed provider
              webhooks are handled by the payment provider and backend systems,
              not stored in browser application state.
            </p>
          </section>
          <section>
            <h2>3. How we use information</h2>
            <ul>
              <li>
                Provide accounts, authentication, profiles, discovery, social
                features, moderation, verification, payments, entitlements, and
                notifications.
              </li>
              <li>
                Verify identity, wallet control, project relationships, and
                eligibility for role-based capabilities.
              </li>
              <li>
                Protect users and the platform, investigate abuse, enforce our
                Terms, and maintain audit records.
              </li>
              <li>
                Operate, troubleshoot, measure, and improve performance,
                accessibility, reliability, and user experience.
              </li>
              <li>
                Send service messages and the optional event/channel
                notifications selected in your preferences.
              </li>
              <li>
                Meet legal, accounting, security, and regulatory obligations.
              </li>
            </ul>
          </section>
          <section>
            <h2>4. How information is shared</h2>
            <p>We may share information with:</p>
            <ul>
              <li>
                Service providers supporting hosting, authentication, storage,
                analytics, communications, security, and payments under
                appropriate contractual controls.
              </li>
              <li>
                Other users when you publish profile details, posts, comments,
                votes, project information, or other content intended to be
                public.
              </li>
              <li>
                Authorities or affected parties when reasonably necessary to
                comply with law, protect rights and safety, investigate fraud,
                or enforce agreements.
              </li>
              <li>
                A successor organization in connection with a merger, financing,
                acquisition, reorganization, or transfer of assets, subject to
                applicable law.
              </li>
            </ul>
            <p>
              Public verification surfaces receive only redacted claim status,
              type, project/user identifiers, and timestamps. Private evidence
              and reviewer-only notes are not intentionally disclosed publicly.
            </p>
          </section>
          <section>
            <h2>5. Cookies and local technology</h2>
            <p>
              We and our providers may use essential cookies or similar
              technology for authentication, security, preferences, and service
              operation. The MemeTokenHub platform JWT is held in memory rather
              than persisted in local storage. Providers such as Privy may use
              their own storage to maintain the authentication session.
            </p>
          </section>
          <section>
            <h2>6. Retention and security</h2>
            <p>
              Information is retained for as long as needed to provide the
              service, satisfy legal or accounting requirements, resolve
              disputes, enforce agreements, and preserve security or moderation
              records. Retention periods vary by data type. We use reasonable
              administrative, technical, and organizational safeguards, but no
              internet transmission or storage system is completely secure.
            </p>
          </section>
          <section>
            <h2>7. Your choices and rights</h2>
            <ul>
              <li>
                Review or update supported profile information from Profile
                settings.
              </li>
              <li>
                Disconnect supported social channels and request account
                deactivation.
              </li>
              <li>
                Configure in-app, email, push, event-level, and digest
                notification preferences.
              </li>
              <li>
                Request access, correction, deletion, restriction, objection, or
                portability where applicable law provides those rights.
              </li>
              <li>
                Withdraw consent where processing relies on consent, without
                affecting earlier lawful processing.
              </li>
            </ul>
            <p>
              Some records may be retained when required for security, fraud
              prevention, transaction accounting, legal compliance, or the
              integrity of public blockchain and moderation histories.
            </p>
          </section>
          <section>
            <h2>8. International processing and children</h2>
            <p>
              Providers may process information in countries other than your
              own, subject to appropriate legal safeguards where required.
              MemeTokenHub is not directed to children under 18, and we do not
              knowingly collect personal information from children.
            </p>
          </section>
          <section>
            <h2>9. Policy changes and contact</h2>
            <p>
              We may update this policy as the service, providers, or legal
              requirements change. Material changes will be identified by a new
              effective date and, where appropriate, an in-product notice.
              Questions or privacy requests may be sent to
              <a href="mailto:privacy@memetokenhub.com">
                {" "}
                privacy@memetokenhub.com
              </a>
              .
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}

export function TermsOfUsePage() {
  return (
    <main className="information-page page-shell">
      <InformationHero
        eyebrow="Terms of use"
        title="Clear rules keep the culture fun."
        description="These Terms govern access to MemeTokenHub and explain the responsibilities that come with using its community, project, verification, and payment features."
        icon={<Scale size={14} />}
      />
      <PolicyNavigation />
      <div className="policy-layout">
        <aside className="policy-summary">
          <FileText />
          <h2>Important reminders</h2>
          <ul>
            <li>
              MemeTokenHub does not provide investment, legal, or tax advice.
            </li>
            <li>Market and community signals can be incomplete or volatile.</li>
            <li>
              You are responsible for your account, wallet, content, and
              decisions.
            </li>
            <li>
              Paid promotion cannot purchase organic rank or verification.
            </li>
          </ul>
          <p>Effective {effectiveDate}</p>
        </aside>
        <article className="policy-content">
          <section>
            <h2>1. Acceptance and eligibility</h2>
            <p>
              By accessing or using MemeTokenHub, you agree to these Terms and
              the Privacy Policy. You must be at least 18 years old and legally
              able to enter a binding agreement. If you use the service for an
              organization, you confirm that you have authority to bind it.
            </p>
          </section>
          <section>
            <h2>2. Accounts and security</h2>
            <ul>
              <li>
                Provide accurate information and keep account and project
                details current.
              </li>
              <li>
                Protect access to your email, wallet, authentication method, and
                connected devices.
              </li>
              <li>
                Notify us promptly if you suspect unauthorized access or account
                misuse.
              </li>
              <li>
                Do not sell, transfer, impersonate, or create accounts to evade
                enforcement.
              </li>
            </ul>
            <p>
              Wallet transactions may be irreversible. We cannot recover keys,
              reverse blockchain transactions, or guarantee access to a
              third-party wallet.
            </p>
          </section>
          <section>
            <h2>3. Community content</h2>
            <p>
              You retain ownership of content you submit. You grant MemeTokenHub
              a worldwide, non-exclusive, royalty-free license to host,
              reproduce, format, display, distribute, and moderate that content
              as needed to operate, secure, and promote the service. You confirm
              that you have the rights required to submit it.
            </p>
            <p>
              We may label, limit, remove, preserve, or report content when
              reasonably necessary to enforce these Terms, protect users, comply
              with law, or maintain platform integrity.
            </p>
          </section>
          <section>
            <h2>4. Prohibited conduct</h2>
            <ul>
              <li>
                Fraud, impersonation, market manipulation, coordinated
                inauthentic behavior, or misleading project claims.
              </li>
              <li>
                Harassment, threats, hate, exploitation, doxxing, or unlawful
                content.
              </li>
              <li>
                Malware, credential theft, phishing, unsafe links, or attempts
                to bypass security and access controls.
              </li>
              <li>
                Automated scraping, spam, excessive requests, or interference
                with service operation unless expressly authorized.
              </li>
              <li>
                Infringement of intellectual-property, privacy, publicity, or
                other rights.
              </li>
              <li>
                Buying or selling verification, moderation outcomes, organic
                votes, reputation, support timestamps, or ranking.
              </li>
            </ul>
          </section>
          <section>
            <h2>5. Projects, verification, and community signals</h2>
            <p>
              Project pages and verification badges provide context, not an
              endorsement, warranty, or guarantee of legitimacy, value, safety,
              or future performance. Votes, likes, comments, follows, support,
              reputation, and trends represent community activity and may be
              incomplete, manipulated, delayed, or wrong. Always conduct your
              own research.
            </p>
          </section>
          <section>
            <h2>6. Payments, subscriptions, and creator content</h2>
            <ul>
              <li>
                Prices, currency, fees, creator proceeds, renewal terms, and
                access periods are disclosed before provider checkout.
              </li>
              <li>
                Access begins only after server-confirmed payment and may not
                begin merely because a checkout page redirects back.
              </li>
              <li>
                Cancelling renewal does not normally revoke access already paid
                through its stated expiration.
              </li>
              <li>
                Refunds, disputes, taxes, and provider processing are subject to
                the displayed offer, applicable law, and provider rules.
              </li>
              <li>
                Tips and subscriptions do not influence organic ranking,
                sentiment, support, reputation, or verification.
              </li>
            </ul>
          </section>
          <section>
            <h2>7. Intellectual property</h2>
            <p>
              The service, design, software, branding, and original content are
              owned by MemeTokenHub or its licensors and protected by applicable
              law. Except for rights expressly granted in these Terms, no
              license is provided. Third-party project names, marks, media, and
              content remain the property of their owners.
            </p>
          </section>
          <section>
            <h2>8. Third-party services</h2>
            <p>
              MemeTokenHub integrates with authentication, wallet, blockchain,
              social, storage, payment, and communication providers. We do not
              control their availability, security, content, fees, or terms.
              Your use of them may create a separate agreement with the
              provider.
            </p>
          </section>
          <section>
            <h2>9. Disclaimers and limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, the service is provided
              “as is” and “as available” without warranties of merchantability,
              fitness for a particular purpose, non-infringement, accuracy, or
              uninterrupted availability. MemeTokenHub is not responsible for
              investment losses, token value changes, blockchain events, wallet
              compromise, third-party services, or user content.
            </p>
            <p>
              To the maximum extent permitted by law, MemeTokenHub and its
              affiliates will not be liable for indirect, incidental, special,
              consequential, exemplary, or punitive damages, lost profits, data,
              goodwill, or digital assets arising from use of the service.
              Rights that cannot lawfully be excluded remain unaffected.
            </p>
          </section>
          <section>
            <h2>10. Suspension, termination, and changes</h2>
            <p>
              You may stop using the service or request account deactivation. We
              may suspend or terminate access, remove content, or restrict
              capabilities for violations, risk, legal requirements, or service
              protection. Provisions that by nature should survive termination
              will survive. We may update these Terms with a revised effective
              date and appropriate notice for material changes.
            </p>
          </section>
          <section>
            <h2>11. General terms and contact</h2>
            <p>
              If any provision is unenforceable, the remaining provisions stay
              effective. A failure to enforce a term is not a waiver. You may
              not assign these Terms without consent; we may assign them as part
              of a business transfer. Applicable governing-law and dispute
              requirements will be presented for the operating entity serving
              your region. Questions may be sent to
              <a href="mailto:legal@memetokenhub.com">
                {" "}
                legal@memetokenhub.com
              </a>
              .
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}

export function AboutPage() {
  return (
    <main className="information-page page-shell">
      <InformationHero
        eyebrow="About MemeTokenHub"
        title="Built for culture. Designed for context."
        description="MemeTokenHub is a social discovery platform where communities can understand projects, people, provenance, and momentum without confusing paid attention with organic belief."
        icon={<Sparkles size={14} />}
      />
      <PolicyNavigation />
      <section className="about-story">
        <div>
          <span className="section-kicker">Our mission</span>
          <h2>Make the meme economy easier to explore—and harder to fake.</h2>
        </div>
        <p>
          Meme tokens move at internet speed. Context rarely does. We bring
          project identity, community conversation, creator perspectives,
          transparent support, and verification into one place so people can
          explore with more information and fewer hidden incentives.
        </p>
      </section>
      <section className="values-grid">
        <article>
          <Eye />
          <h2>Context over hype</h2>
          <p>
            Market previews, project facts, sentiment, and community activity
            are clearly labelled so users can understand what a signal means—and
            what it does not.
          </p>
        </article>
        <article>
          <Users />
          <h2>Community with provenance</h2>
          <p>
            Server timestamps, public profiles, reputation, support history, and
            moderation records make social context more useful and accountable.
          </p>
        </article>
        <article>
          <BadgeCheck />
          <h2>Verification without exposure</h2>
          <p>
            Project relationships can be reviewed through private evidence while
            public badges reveal only the minimum redacted status needed for
            trust.
          </p>
        </article>
        <article>
          <HeartHandshake />
          <h2>Creators paid transparently</h2>
          <p>
            Subscriptions, tips, and premium insights disclose price, fees,
            proceeds, and renewal terms while remaining separate from organic
            rankings.
          </p>
        </article>
      </section>
      <section className="about-flow">
        <div className="section-heading">
          <div>
            <span className="section-kicker">How we work</span>
            <h2>One hub, clear boundaries.</h2>
          </div>
        </div>
        <ol>
          <li>
            <strong>Discover.</strong>
            <span>
              Find projects, people, posts, networks, and community signals.
            </span>
          </li>
          <li>
            <strong>Connect.</strong>
            <span>
              Use Privy with email or wallet, then establish a separate
              MemeTokenHub platform session.
            </span>
          </li>
          <li>
            <strong>Participate.</strong>
            <span>
              Follow, comment, vote, support, publish, verify, and manage your
              notification choices.
            </span>
          </li>
          <li>
            <strong>Decide independently.</strong>
            <span>
              Use the context as one input—not financial, legal, tax, or
              investment advice.
            </span>
          </li>
        </ol>
      </section>
      <section className="about-cta">
        <BookOpenCheck />
        <div>
          <h2>Explore responsibly.</h2>
          <p>
            Read the trust center, understand community signals, and always do
            your own research before interacting with a project or digital
            asset.
          </p>
        </div>
        <Link className="button button-primary" to="/learn">
          Visit the trust center
        </Link>
      </section>
    </main>
  );
}

const faqGroups = [
  {
    title: "Getting started",
    questions: [
      {
        question: "What is MemeTokenHub?",
        answer:
          "MemeTokenHub is a social discovery and context platform for meme-token communities. It combines project information, community activity, creator content, verification, and transparent monetization. It is not an exchange, wallet, broker, or investment adviser.",
      },
      {
        question: "Do I need an account to browse?",
        answer:
          "No. Discovery, project details, public profiles, community leaderboards, public insights, verification status, About, FAQ, and trust information are public. An account is required for personalized or write actions such as following, voting, commenting, publishing, claims, payments, and notifications.",
      },
      {
        question: "How do I sign in?",
        answer:
          "Select Connect and use Privy's supported email or wallet flow. After Privy authenticates you, MemeTokenHub exchanges the temporary Privy token for an in-memory platform session used with the API Gateway.",
      },
      {
        question:
          "Why does the app say my session exchange failed after Privy connected?",
        answer:
          "Privy authentication and MemeTokenHub authorization are separate steps. Your Privy login may succeed while the Gateway exchange is temporarily unavailable. Select Retry secure session to repeat only the exchange, or Sign out to end the Privy session.",
      },
    ],
  },
  {
    title: "Projects and community",
    questions: [
      {
        question: "Are market figures and sentiment financial advice?",
        answer:
          "No. Market previews, sentiment, votes, comments, trends, reputation, and support are informational community context. They may be delayed, incomplete, volatile, or manipulated. Always conduct independent research.",
      },
      {
        question: "What does a verification badge mean?",
        answer:
          "A badge means a specific project ownership, social identity, or representative claim completed the documented review process. It does not guarantee that a token is safe, valuable, lawful, or free from risk.",
      },
      {
        question: "How can I launch or manage a project page?",
        answer:
          "Authenticated developers or creators with project-writing capability can use Launch to create a draft, provide official metadata, upload a logo and banner, add HTTPS links, and publish after required fields are complete.",
      },
      {
        question: "Can a creator pay to rank higher?",
        answer:
          "No. Subscriptions, tips, premium posts, and other paid activity are kept separate from organic ranking, sentiment, reputation, support timestamps, and verification decisions.",
      },
    ],
  },
  {
    title: "Verification, payments, and privacy",
    questions: [
      {
        question: "Who can see claim evidence?",
        answer:
          "Claim evidence is private to the owner and authorized moderators. Public claim pages use a redacted DTO and show only the claim type, project/user identifiers, status, and relevant timestamps—not attachments, proof fields, reviewer identity, or notes.",
      },
      {
        question: "When does paid access begin?",
        answer:
          "Paid access begins only after Payment Service validates the payment provider webhook and records the entitlement. A checkout redirect or client callback by itself never unlocks subscriber or premium content.",
      },
      {
        question: "What happens when I cancel a subscription?",
        answer:
          "Cancellation turns off future renewal. Access already paid for normally remains available until the entitlement's displayed expiry, subject to the checkout terms and applicable law.",
      },
      {
        question: "Where can I control notifications?",
        answer:
          "Open the bell icon to visit Notifications. You can control In-app, Email, and Push globally, set per-event channel choices, choose an Immediate, Daily, Weekly, or Off digest, and mark inbox items read.",
      },
      {
        question: "Where can I manage or delete account information?",
        answer:
          "Use Profile to update supported account details, disconnect social channels, manage preferences, and request account deactivation. Privacy requests can also be sent to privacy@memetokenhub.com.",
      },
    ],
  },
];

export function FaqPage() {
  return (
    <main className="information-page page-shell">
      <InformationHero
        eyebrow="Frequently asked questions"
        title="Questions are a feature."
        description="Quick answers about accounts, projects, verification, payments, privacy, and the signals you see across MemeTokenHub."
        icon={<CircleHelp size={14} />}
      />
      <PolicyNavigation />
      <div className="faq-layout">
        {faqGroups.map((group) => (
          <section className="faq-group" key={group.title}>
            <h2>{group.title}</h2>
            <div>
              {group.questions.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
      <section className="faq-contact">
        <CircleHelp />
        <div>
          <h2>Still need help?</h2>
          <p>
            Contact the MemeTokenHub team and include the page, project, or
            feature involved. Never email private keys, seed phrases, passwords,
            or full payment credentials.
          </p>
        </div>
        <a
          className="button button-secondary"
          href="mailto:help@memetokenhub.com"
        >
          Email support
        </a>
      </section>
    </main>
  );
}
