import { ImageUp, Rocket, Save, ShieldCheck } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useAuth } from "../auth/authContext";
import type { TokenProject, TokenWriteInput } from "../services/tokenService";
import {
  createToken,
  getCreatorTokens,
  publishToken,
  updateToken,
  uploadProjectMedia,
} from "../services/tokenService";

const emptyProject: TokenWriteInput = {
  name: "",
  symbol: "",
  description: "",
  network: "Solana",
  contractAddress: "",
  category: "Meme",
  websiteUrl: "",
  logoUrl: "",
  bannerUrl: "",
  socialLinks: [],
};

export function ProjectManagementPage() {
  const { status, user, login } = useAuth();
  const [projects, setProjects] = useState<TokenProject[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [draft, setDraft] = useState<TokenWriteInput>(emptyProject);
  const [message, setMessage] = useState("");
  const canWrite =
    user?.capabilities?.includes("projects:write") ||
    ["Developer", "Creator", "Admin"].includes(user?.role ?? "") ||
    user?.accountType === "Developer";
  const canPublish = Boolean(
    selectedId &&
    draft.logoUrl &&
    draft.bannerUrl &&
    draft.websiteUrl &&
    draft.network &&
    draft.contractAddress,
  );
  useEffect(() => {
    if (status === "authenticated" && user)
      getCreatorTokens(user.userId)
        .then(setProjects)
        .catch((error: unknown) =>
          setMessage(
            error instanceof Error
              ? error.message
              : "Projects could not be loaded.",
          ),
        );
  }, [status, user]);
  if (status !== "authenticated")
    return (
      <main className="auth-page page-shell">
        <section className="auth-panel">
          <Rocket />
          <h1>Launch your project home.</h1>
          <p>
            Connect with Privy to create and publish a meme-token community.
          </p>
          <button
            className="button button-primary"
            type="button"
            onClick={login}
          >
            Connect with Privy
          </button>
        </section>
      </main>
    );
  if (!canWrite)
    return (
      <main className="auth-page page-shell">
        <section className="auth-panel">
          <ShieldCheck />
          <h1>Developer access required.</h1>
          <p>
            Your account needs the projects:write capability before it can
            create or publish projects.
          </p>
        </section>
      </main>
    );
  function selectProject(project: TokenProject) {
    setSelectedId(project.tokenId);
    setDraft({
      name: project.name,
      symbol: project.symbol,
      description: project.description,
      network: project.network,
      contractAddress: project.contractAddress,
      category: project.category,
      websiteUrl: project.websiteUrl,
      logoUrl: project.logoUrl,
      bannerUrl: project.bannerUrl,
      socialLinks: project.socialLinks,
    });
  }
  function setSocialLink(platform: string, url: string) {
    setDraft((current) => ({
      ...current,
      socialLinks: [
        ...(current.socialLinks ?? []).filter(
          (link) => link.platform !== platform,
        ),
        ...(url ? [{ platform, url }] : []),
      ],
    }));
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    const publicUrls = [
      draft.websiteUrl,
      ...(draft.socialLinks ?? []).map((link) => link.url),
    ].filter(Boolean);
    if (publicUrls.some((url) => !url?.startsWith("https://"))) {
      setMessage("Official website and social links must use HTTPS.");
      return;
    }
    setMessage("Saving draft…");
    try {
      const saved = selectedId
        ? await updateToken(selectedId, draft)
        : await createToken(draft);
      setSelectedId(saved.tokenId);
      setProjects((current) => [
        saved,
        ...current.filter((item) => item.tokenId !== saved.tokenId),
      ]);
      setMessage("Draft saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Draft save failed.");
    }
  }
  async function media(file: File | undefined, assetType: "Logo" | "Banner") {
    if (!file) return;
    setMessage(`Uploading ${assetType.toLowerCase()}…`);
    try {
      const assetUrl = await uploadProjectMedia(file, assetType);
      setDraft((current) => ({
        ...current,
        [assetType === "Logo" ? "logoUrl" : "bannerUrl"]: assetUrl,
      }));
      setMessage(`${assetType} uploaded. Save the draft to attach it.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }
  async function publish() {
    if (!selectedId) return;
    setMessage("Publishing project…");
    try {
      const published = await publishToken(selectedId);
      setProjects((current) =>
        current.map((item) =>
          item.tokenId === published.tokenId ? published : item,
        ),
      );
      setMessage(
        `Published${published.publishedAt ? ` at ${new Date(published.publishedAt).toLocaleString()}` : ""}.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Publish failed.");
    }
  }
  return (
    <main className="subpage page-shell">
      <div className="page-intro">
        <span className="eyebrow purple">
          <Rocket size={14} /> Developer studio
        </span>
        <h1>
          Build your
          <br />
          <span>project home.</span>
        </h1>
        <p>
          Create an inexpensive draft, upload approved media, and publish only
          after the canonical project details are ready.
        </p>
      </div>
      {message && (
        <p className="form-status" role="status">
          {message}
        </p>
      )}
      <div className="project-studio">
        <aside className="project-list">
          <button
            type="button"
            onClick={() => {
              setSelectedId(undefined);
              setDraft(emptyProject);
            }}
          >
            + New project
          </button>
          {projects.map((project) => (
            <button
              className={selectedId === project.tokenId ? "active" : ""}
              type="button"
              key={project.tokenId}
              onClick={() => selectProject(project)}
            >
              <strong>{project.name}</strong>
              <span>{project.launchStatus}</span>
            </button>
          ))}
        </aside>
        <form className="settings-card project-form" onSubmit={save}>
          <h2>{selectedId ? "Edit project" : "New project draft"}</h2>
          <div className="form-row">
            <label>
              Name
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
                required
              />
            </label>
            <label>
              Symbol
              <input
                value={draft.symbol}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    symbol: event.target.value.toUpperCase(),
                  })
                }
                required
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              value={draft.description}
              onChange={(event) =>
                setDraft({ ...draft, description: event.target.value })
              }
              required
            />
          </label>
          <div className="form-row">
            <label>
              Network
              <input
                value={draft.network}
                onChange={(event) =>
                  setDraft({ ...draft, network: event.target.value })
                }
                required
              />
            </label>
            <label>
              Category
              <input
                value={draft.category}
                onChange={(event) =>
                  setDraft({ ...draft, category: event.target.value })
                }
                required
              />
            </label>
          </div>
          <label>
            Contract address
            <input
              value={draft.contractAddress}
              onChange={(event) =>
                setDraft({ ...draft, contractAddress: event.target.value })
              }
              required
            />
          </label>
          <label>
            Official website
            <input
              type="url"
              value={draft.websiteUrl}
              onChange={(event) =>
                setDraft({ ...draft, websiteUrl: event.target.value })
              }
              placeholder="https://"
            />
          </label>
          <div className="form-row">
            <label>
              X community URL
              <input
                type="url"
                value={
                  draft.socialLinks?.find((link) => link.platform === "X")
                    ?.url ?? ""
                }
                onChange={(event) => setSocialLink("X", event.target.value)}
                placeholder="https://x.com/…"
              />
            </label>
            <label>
              Telegram URL
              <input
                type="url"
                value={
                  draft.socialLinks?.find(
                    (link) => link.platform === "Telegram",
                  )?.url ?? ""
                }
                onChange={(event) =>
                  setSocialLink("Telegram", event.target.value)
                }
                placeholder="https://t.me/…"
              />
            </label>
          </div>
          <div className="media-inputs">
            <label>
              <ImageUp /> Logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  void media(event.target.files?.[0], "Logo")
                }
              />
              <small>{draft.logoUrl || "No logo uploaded"}</small>
            </label>
            <label>
              <ImageUp /> Banner
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  void media(event.target.files?.[0], "Banner")
                }
              />
              <small>{draft.bannerUrl || "No banner uploaded"}</small>
            </label>
          </div>
          <div className="hero-actions">
            <button className="button button-secondary" type="submit">
              <Save size={16} /> Save draft
            </button>
            <button
              className="button button-primary"
              type="button"
              disabled={!canPublish}
              onClick={() => void publish()}
            >
              <Rocket size={16} /> Publish
            </button>
          </div>
          {!canPublish && selectedId && (
            <p className="publish-requirements">
              Add a logo, banner, HTTPS website, network, and contract address
              before publishing.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
