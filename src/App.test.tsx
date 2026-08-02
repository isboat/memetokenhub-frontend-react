import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

function renderApplication(initialRoute = "/") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>,
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
      screen.getByRole("heading", { name: /your corner of.*meme culture/i }),
    ).toBeInTheDocument();
  });
});
