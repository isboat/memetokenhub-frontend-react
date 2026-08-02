import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import { AuthContext, type AuthContextValue } from "./auth/authContext";
import { AuthButton } from "./components/AuthButton";
import { exchangePrivyToken } from "./services/userService";
import {
  searchUsers,
  updateUser,
  updateUserRole,
  verifyWallet,
} from "./services/userService";
import { clearPlatformJwt, setPlatformJwt } from "./auth/platformTokenStore";
import {
  createPost,
  followTarget,
  getFeed,
  getMyFollows,
  getPosts,
  getTokenSupporters,
  getTokenVote,
  supportToken,
  voteOnToken,
} from "./services/socialService";
import {
  createToken,
  getCreatorTokens,
  getTokenFeed,
  getTokenSentiment,
  listTokens,
  publishToken,
  requestMediaUpload,
  updateToken,
  uploadProjectMedia,
} from "./services/tokenService";
import {
  appealClaim,
  getPendingClaims,
  getPublicClaimStatus,
  getReviewedClaims,
  getUserClaims,
  reviewClaim,
  submitClaim,
  uploadClaimAttachment,
} from "./services/claimService";

function renderApplication(initialRoute = "/") {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    </AuthProvider>,
  );
}

afterEach(cleanup);
afterEach(() => {
  clearPlatformJwt();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("MemeTokenHub application", () => {
  it("renders the main discovery experience", () => {
    renderApplication();
    expect(
      screen.getByRole("heading", { name: /the meme market.*made social/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Trending projects" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Pepe").length).toBeGreaterThan(0);
  });

  it("filters token cards by a search term", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");
    vi.spyOn(globalThis, "fetch").mockImplementation(async (request) => {
      const url = String(request);
      const payload = url.endsWith("/api/tokens/networks")
        ? []
        : url.includes("search=bonk")
          ? [
              {
                tokenId: "bonk",
                name: "Bonk",
                symbol: "BONK",
                description: "Community coin",
                network: "Solana",
                status: "Featured",
                launchStatus: "Published",
                community: { supportersCount: 10, sentimentScore: 90 },
              },
            ]
          : [];
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    const user = userEvent.setup();
    renderApplication();
    await user.type(
      screen.getByPlaceholderText("Search projects or symbols"),
      "bonk",
    );
    await waitFor(() =>
      expect(
        screen.getByText("Live Token Service discovery."),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { name: /Bonk/ })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /Mog Coin/ }),
    ).not.toBeInTheDocument();
  });

  it("renders a token detail route", () => {
    renderApplication("/token/mog");
    expect(
      screen.getByRole("heading", { level: 1, name: /Mog Coin/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("95% hot")).toBeInTheDocument();
  });

  it("routes follow actions through the sign-in dashboard", async () => {
    const user = userEvent.setup();
    renderApplication();

    await user.click(
      screen.getByRole("link", { name: "Sign in to follow MemeLord" }),
    );

    expect(
      screen.getByRole("heading", { name: /connect your Privy app/i }),
    ).toBeInTheDocument();
  });

  it("sends the documented Privy token exchange request", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          jwtToken: "platform-jwt",
          user: { userId: "user-123", username: "MemeLord" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(
      exchangePrivyToken("privy-access-token"),
    ).resolves.toMatchObject({
      jwtToken: "platform-jwt",
      user: { userId: "user-123" },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/users/auth/exchange",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ privyToken: "privy-access-token" }),
      }),
    );
    fetchMock.mockRestore();
    vi.unstubAllEnvs();
  });

  it("shows a retry action when Privy succeeded but token exchange failed", async () => {
    const user = userEvent.setup();
    const retryExchange = vi.fn();
    const failedExchangeContext: AuthContextValue = {
      status: "error",
      user: null,
      errorMessage: "We could not finish signing you in. Please try again.",
      login: vi.fn(),
      logout: vi.fn(async () => undefined),
      retryExchange,
    };

    render(
      <AuthContext.Provider value={failedExchangeContext}>
        <AuthButton />
      </AuthContext.Provider>,
    );

    expect(
      screen.queryByRole("button", { name: "Connect" }),
    ).not.toBeInTheDocument();
    const retryButton = screen.getByRole("button", { name: "Retry session" });
    expect(retryButton).toHaveAttribute(
      "title",
      failedExchangeContext.errorMessage,
    );
    await user.click(retryButton);
    expect(retryExchange).toHaveBeenCalledOnce();
  });

  it("builds public user search filters from the documented contract", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("[]", { status: 200 }));
    await searchUsers({
      query: "meme",
      limit: 12,
      accountType: "KOL",
      verified: true,
      network: "Solana",
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.example.com/api/users/search?query=meme&limit=12&accountType=KOL&verified=true&network=Solana",
    );
  });

  it("attaches the platform JWT to protected profile, wallet, and role writes", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");
    setPlatformJwt("platform-jwt");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(
      async () =>
        new Response(JSON.stringify({ userId: "user-123", verified: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    await updateUser("user-123", { displayName: "Meme Lord" });
    await verifyWallet("user-123", "signed-proof");
    await updateUserRole("user-123", "KOL");
    for (const [, options] of fetchMock.mock.calls) {
      expect(new Headers(options?.headers).get("Authorization")).toBe(
        "Bearer platform-jwt",
      );
    }
  });

  it("builds token discovery, feed, creator, and sentiment requests", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => new Response("[]", { status: 200 }));
    await listTokens({
      search: "frog",
      network: "Solana",
      creatorId: "creator-1",
      sortBy: "popularity",
      limit: 10,
      offset: 20,
    });
    await getTokenFeed("featured", 6);
    await getCreatorTokens("creator-1", 10, 5);
    fetchMock.mockImplementationOnce(
      async () =>
        new Response(
          JSON.stringify({ hotVotes: 1, notVotes: 0, sentimentScore: 100 }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );
    await getTokenSentiment("token-1", "30d");
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "https://api.example.com/api/tokens?search=frog&network=Solana&creatorId=creator-1&sortBy=popularity&limit=10&offset=20",
      "https://api.example.com/api/tokens/feeds/featured?limit=6",
      "https://api.example.com/api/tokens/by-creator/creator-1?limit=10&offset=5",
      "https://api.example.com/api/tokens/token-1/sentiment?window=30d",
    ]);
  });

  it("uses the platform JWT for token drafts, updates, publishing, and media URLs", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");
    setPlatformJwt("platform-jwt");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(
        async () =>
          new Response(
            JSON.stringify({ tokenId: "token-1", name: "Frog", symbol: "FRG" }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
      );
    const input = {
      name: "Frog",
      symbol: "FRG",
      description: "A frog community",
      network: "Solana",
      contractAddress: "contract",
      category: "Meme",
    };
    await createToken(input);
    await updateToken("token-1", { description: "Updated" });
    await publishToken("token-1");
    await requestMediaUpload({
      fileName: "logo.png",
      contentType: "image/png",
      assetType: "Logo",
    });
    for (const [, options] of fetchMock.mock.calls)
      expect(new Headers(options?.headers).get("Authorization")).toBe(
        "Bearer platform-jwt",
      );
    expect(fetchMock.mock.calls.map(([, options]) => options?.method)).toEqual([
      "POST",
      "PUT",
      "POST",
      "POST",
    ]);
  });

  it("normalizes paginated token lists and avoids an empty query suffix", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [{ tokenId: "token-1" }],
          limit: 20,
          offset: 0,
          total: 1,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    await expect(listTokens()).resolves.toEqual([{ tokenId: "token-1" }]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/tokens",
      expect.anything(),
    );
  });

  it("rejects unsupported and oversized project media before requesting a signed URL", async () => {
    await expect(
      uploadProjectMedia(
        new File(["text"], "logo.txt", { type: "text/plain" }),
        "Logo",
      ),
    ).rejects.toThrow("PNG, JPEG, or WebP");
    await expect(
      uploadProjectMedia(
        new File([new Uint8Array(5 * 1024 * 1024 + 1)], "logo.png", {
          type: "image/png",
        }),
        "Logo",
      ),
    ).rejects.toThrow("5 MB or smaller");
  });

  it("builds social feed, tracked-target, supporter, vote, and post read requests", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => new Response("[]", { status: 200 }));
    await getFeed("user-1", 10, 5);
    await getMyFollows("Token", 20, 0);
    await getTokenSupporters("token-1", true, 10, 2);
    fetchMock.mockImplementationOnce(
      async () =>
        new Response(JSON.stringify({ hotVotes: 2, notHotVotes: 1 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    await getTokenVote("token-1");
    fetchMock.mockImplementationOnce(
      async () => new Response("[]", { status: 200 }),
    );
    await getPosts({
      authorId: "kol-1",
      tokenId: "token-1",
      access: "Public",
      limit: 10,
      offset: 0,
    });
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "https://api.example.com/api/social/feed/user-1?limit=10&offset=5",
      "https://api.example.com/api/social/follows/me?limit=20&offset=0&targetType=Token",
      "https://api.example.com/api/social/tokens/token-1/supporters?includeWithdrawn=true&limit=10&offset=2",
      "https://api.example.com/api/social/tokens/token-1/vote",
      "https://api.example.com/api/social/posts?authorId=kol-1&tokenId=token-1&access=Public&limit=10&offset=0",
    ]);
  });

  it("authenticates generalized follows, support, votes, and post writes", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");
    setPlatformJwt("platform-jwt");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(
      async () =>
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    await followTarget("Network", "Solana");
    await supportToken("token-1", "Early support");
    await voteOnToken("token-1", "Hot");
    await createPost({
      tokenId: "token-1",
      content: "Insight",
      mediaUrls: [],
      access: "Public",
    });
    for (const [, options] of fetchMock.mock.calls)
      expect(new Headers(options?.headers).get("Authorization")).toBe(
        "Bearer platform-jwt",
      );
    expect(fetchMock.mock.calls.map(([, options]) => options?.method)).toEqual([
      "POST",
      "POST",
      "POST",
      "POST",
    ]);
  });

  it("builds every Claim Service read and state-transition request", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");
    setPlatformJwt("platform-jwt");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(
      async () =>
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );

    await getUserClaims("user / 1");
    await getPendingClaims();
    await getReviewedClaims({
      status: "Approved",
      reviewerId: "mod-1",
      limit: 10,
      offset: 5,
    });
    fetchMock.mockImplementation(
      async () =>
        new Response(JSON.stringify({ claimId: "claim-1" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    await submitClaim({
      tokenId: "token-1",
      type: "ProjectOwnership",
      description: "I control the project contract and official website.",
      attachments: ["https://objects.example/evidence.pdf"],
      proofFields: { proofMethod: "DnsSiteProof", siteProof: "mth-proof" },
    });
    await reviewClaim("claim-1", "Approved", "Signature verified");
    await appealClaim("claim-1", {
      reason: "New evidence is available for moderator review.",
      proofFields: { walletTx: "tx-2" },
      attachments: [],
    });
    await getPublicClaimStatus("claim-1");

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "https://api.example.com/api/claims/user%20%2F%201",
      "https://api.example.com/api/claims/pending",
      "https://api.example.com/api/claims/reviewed?limit=10&offset=5&status=Approved&reviewerId=mod-1",
      "https://api.example.com/api/claims",
      "https://api.example.com/api/claims/claim-1/review",
      "https://api.example.com/api/claims/claim-1/appeal",
      "https://api.example.com/api/claims/claim-1/public-status",
    ]);
    expect(fetchMock.mock.calls.map(([, options]) => options?.method)).toEqual([
      undefined,
      undefined,
      undefined,
      "POST",
      "PUT",
      "POST",
      undefined,
    ]);
    for (const [, options] of fetchMock.mock.calls)
      expect(new Headers(options?.headers).get("Authorization")).toBe(
        "Bearer platform-jwt",
      );
  });

  it("validates claim evidence before requesting a signed upload", async () => {
    await expect(
      uploadClaimAttachment(
        new File(["unsafe"], "proof.svg", { type: "image/svg+xml" }),
      ),
    ).rejects.toThrow("PNG, JPEG, WebP, or PDF");
    await expect(
      uploadClaimAttachment(
        new File([new Uint8Array(10 * 1024 * 1024 + 1)], "proof.pdf", {
          type: "application/pdf",
        }),
      ),
    ).rejects.toThrow("10 MB or smaller");
  });

  it("renders only the redacted public claim status fields", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          claimId: "claim-1",
          userId: "user-1",
          tokenId: "token-1",
          type: "ProjectOwnership",
          status: "Approved",
          reviewedAt: "2026-08-01T12:00:00Z",
          proofFields: { walletTx: "private-transaction" },
          reviewNotes: "private moderator note",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    renderApplication("/claims/claim-1/status");
    expect(
      await screen.findByRole("heading", {
        name: "Verified project relationship",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("token-1")).toBeInTheDocument();
    expect(screen.queryByText("private-transaction")).not.toBeInTheDocument();
    expect(
      screen.queryByText("private moderator note"),
    ).not.toBeInTheDocument();
  });
});
