import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import { AuthContext, type AuthContextValue } from "./auth/authContext";
import { AuthButton } from "./components/AuthButton";
import { exchangePrivyToken } from "./services/userService";

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
    const user = userEvent.setup();
    renderApplication();
    await user.type(
      screen.getByPlaceholderText("Search projects or symbols"),
      "bonk",
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
});
