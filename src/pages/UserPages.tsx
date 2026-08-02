import {
  BadgeCheck,
  Search,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import type { PlatformUser, SocialChannel } from "../auth/authTypes";
import {
  connectSocialChannel,
  deactivateUser,
  disconnectSocialChannel,
  getCurrentUser,
  getUser,
  getSocialChannels,
  searchUsers,
  updateUser,
  updateUserRole,
  verifySocialChannel,
  verifyWallet,
} from "../services/userService";

function StatusMessage({
  message,
  isError = false,
}: {
  message: string;
  isError?: boolean;
}) {
  return (
    <p className={isError ? "form-status error" : "form-status"} role="status">
      {message}
    </p>
  );
}

export function PeopleDirectoryPage() {
  const [query, setQuery] = useState("");
  const [accountType, setAccountType] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [network, setNetwork] = useState("");
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [status, setStatus] = useState(
    "Search for KOLs, developers, and fans.",
  );

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    setStatus("Searching…");
    try {
      const results = await searchUsers({
        query,
        limit: 24,
        accountType,
        verified: verifiedOnly || undefined,
        network,
      });
      setUsers(results);
      setStatus(
        results.length
          ? `${results.length} people found.`
          : "No matching profiles found.",
      );
    } catch (error) {
      setUsers([]);
      setStatus(error instanceof Error ? error.message : "Search failed.");
    }
  }

  return (
    <main className="subpage page-shell">
      <div className="page-intro">
        <span className="eyebrow purple">
          <Search size={14} /> People directory
        </span>
        <h1>
          Find your
          <br />
          <span>community.</span>
        </h1>
        <p>
          Search public-safe profiles by name, account type, verification, and
          network.
        </p>
      </div>
      <form className="directory-filters" onSubmit={handleSearch}>
        <label>
          Username or wallet
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            required
            placeholder="Search people"
          />
        </label>
        <label>
          Account type
          <select
            value={accountType}
            onChange={(event) => setAccountType(event.target.value)}
          >
            <option value="">All types</option>
            <option>Fan</option>
            <option>KOL</option>
            <option>Developer</option>
          </select>
        </label>
        <label>
          Network
          <input
            value={network}
            onChange={(event) => setNetwork(event.target.value)}
            placeholder="Any network"
          />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(event) => setVerifiedOnly(event.target.checked)}
          />{" "}
          Verified only
        </label>
        <button className="button button-primary" type="submit">
          Search
        </button>
      </form>
      <StatusMessage message={status} />
      <div className="people-results">
        {users.map((user) => (
          <article className="person-result" key={user.userId}>
            <span className="leader-avatar">
              {user.profile?.avatarUrl ? (
                <img src={user.profile.avatarUrl} alt="" />
              ) : (
                "👤"
              )}
            </span>
            <div>
              <h2>
                {user.displayName ?? user.username ?? "Community member"}{" "}
                {user.isVerified && <BadgeCheck size={16} />}
              </h2>
              <p>{user.accountType ?? user.role ?? "Member"}</p>
            </div>
            <Link
              className="button button-secondary compact"
              to={`/profile/${encodeURIComponent(user.userId)}`}
            >
              View profile
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

export function PublicUserProfilePage() {
  const { userId = "" } = useParams();
  const [profile, setProfile] = useState<PlatformUser | null>(null);
  const [channels, setChannels] = useState<SocialChannel[]>([]);
  const [message, setMessage] = useState("Loading public profile…");

  useEffect(() => {
    let active = true;
    Promise.all([getUser(userId), getSocialChannels(userId)])
      .then(([loadedProfile, loadedChannels]) => {
        if (active) {
          setProfile(loadedProfile);
          setChannels(loadedChannels);
          setMessage("");
        }
      })
      .catch((error: unknown) => {
        if (active)
          setMessage(
            error instanceof Error ? error.message : "Profile loading failed.",
          );
      });
    return () => {
      active = false;
    };
  }, [userId]);

  if (!profile)
    return (
      <main className="auth-page page-shell">
        <section className="auth-panel">
          <StatusMessage message={message} />
        </section>
      </main>
    );
  return (
    <main className="subpage page-shell">
      <div className="public-profile-card">
        <div className="detail-mascot">
          {profile.profile?.avatarUrl ? (
            <img src={profile.profile.avatarUrl} alt="" />
          ) : (
            "👤"
          )}
        </div>
        <div>
          <span className="eyebrow purple">
            {profile.accountType ?? profile.role ?? "Community member"}
          </span>
          <h1>{profile.displayName ?? profile.username}</h1>
          <p>
            {profile.profile?.bio ??
              "This community member has not added a bio yet."}
          </p>
          <div className="profile-metrics">
            <span>
              <strong>{profile.profile?.followerCount ?? 0}</strong> followers
            </span>
            <span>
              <strong>{profile.profile?.projectsCount ?? 0}</strong> projects
            </span>
            <span>
              <strong>{profile.profile?.reputationScore ?? 0}</strong>{" "}
              reputation
            </span>
          </div>
          <div className="channel-list">
            {channels.map((channel) => (
              <div key={channel.platform}>
                <span>
                  {channel.platform} {channel.handle && `@${channel.handle}`}
                </span>
                <strong>{channel.verified ? "Verified" : "Connected"}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export function AccountSettingsPage() {
  const { status: authStatus, login, logout } = useAuth();
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [channels, setChannels] = useState<SocialChannel[]>([]);
  const [message, setMessage] = useState("Loading your private profile…");
  const [walletProof, setWalletProof] = useState("");
  const [platform, setPlatform] = useState("X");
  const [authorizationCode, setAuthorizationCode] = useState("");
  const [verificationChallenge, setVerificationChallenge] = useState("");

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let active = true;
    getCurrentUser()
      .then(async (profile) => ({
        profile,
        connected: await getSocialChannels(profile.userId),
      }))
      .then(({ profile, connected }) => {
        if (active) {
          setUser(profile);
          setChannels(connected);
          setMessage("");
        }
      })
      .catch((error: unknown) => {
        if (active)
          setMessage(
            error instanceof Error ? error.message : "Profile loading failed.",
          );
      });
    return () => {
      active = false;
    };
  }, [authStatus]);

  if (authStatus !== "authenticated")
    return (
      <main className="auth-page page-shell">
        <section className="auth-panel">
          <UserRound />
          <h1>Sign in to manage your profile.</h1>
          <p>
            Your private profile, wallet proofs, preferences, and connected
            channels require a MemeTokenHub session.
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
  if (!user)
    return (
      <main className="auth-page page-shell">
        <section className="auth-panel">
          <StatusMessage message={message} />
        </section>
      </main>
    );

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage("Saving profile…");
    try {
      const updated = await updateUser(user!.userId, {
        username: String(form.get("username")),
        displayName: String(form.get("displayName")),
        accountType: String(form.get("accountType")),
        profile: {
          bio: String(form.get("bio")),
          avatarUrl: String(form.get("avatarUrl")),
          bannerUrl: String(form.get("bannerUrl")),
          socialLinks: String(form.get("socialLinks"))
            .split("\n")
            .filter(Boolean),
        },
        preferences: {
          notificationsEnabled: form.get("notificationsEnabled") === "on",
          theme: "dark",
        },
      });
      setUser(updated);
      setMessage("Profile saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    }
  }

  async function handleWalletVerification(event: FormEvent) {
    event.preventDefault();
    setMessage("Verifying wallet proof…");
    try {
      const result = await verifyWallet(user!.userId, walletProof);
      setUser((current) =>
        current ? { ...current, isVerified: result.verified } : current,
      );
      setWalletProof("");
      setMessage(
        result.verified ? "Wallet verified." : "Wallet proof was not accepted.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Verification failed.",
      );
    }
  }
  async function handleConnectChannel(event: FormEvent) {
    event.preventDefault();
    setMessage("Connecting social channel…");
    try {
      await connectSocialChannel(user!.userId, {
        platform,
        authorizationCode,
        redirectUri: window.location.origin + "/profile",
      });
      setChannels(await getSocialChannels(user!.userId));
      setAuthorizationCode("");
      setMessage("Social channel connected.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Connection failed.");
    }
  }

  return (
    <main className="subpage page-shell">
      <div className="page-intro">
        <span className="eyebrow purple">
          <UserRound size={14} /> Account settings
        </span>
        <h1>
          Own your
          <br />
          <span>identity.</span>
        </h1>
        <p>
          Manage your private profile and verification settings. Sensitive
          proofs are never rendered on public pages.
        </p>
      </div>
      {message && <StatusMessage message={message} />}
      <div className="settings-grid">
        <form className="settings-card" onSubmit={saveProfile}>
          <h2>Profile</h2>
          <label>
            Username
            <input name="username" defaultValue={user.username} />
          </label>
          <label>
            Display name
            <input name="displayName" defaultValue={user.displayName} />
          </label>
          <label>
            Account type
            <select name="accountType" defaultValue={user.accountType ?? "Fan"}>
              <option>Fan</option>
              <option>KOL</option>
              <option>Developer</option>
            </select>
          </label>
          <label>
            Bio
            <textarea name="bio" defaultValue={user.profile?.bio} />
          </label>
          <label>
            Avatar URL
            <input
              name="avatarUrl"
              type="url"
              defaultValue={user.profile?.avatarUrl}
            />
          </label>
          <label>
            Banner URL
            <input
              name="bannerUrl"
              type="url"
              defaultValue={user.profile?.bannerUrl}
            />
          </label>
          <label>
            Public social links
            <textarea
              name="socialLinks"
              defaultValue={user.profile?.socialLinks?.join("\n")}
            />
          </label>
          <label className="checkbox-label">
            <input
              name="notificationsEnabled"
              type="checkbox"
              defaultChecked={user.preferences?.notificationsEnabled}
            />{" "}
            Notifications enabled
          </label>
          <button className="button button-primary" type="submit">
            Save changes
          </button>
        </form>
        <div className="settings-column">
          <form className="settings-card" onSubmit={handleWalletVerification}>
            <h2>
              <Wallet size={18} /> Wallet verification
            </h2>
            <p>
              Status:{" "}
              <strong>{user.isVerified ? "Verified" : "Not verified"}</strong>
            </p>
            <label>
              Signature or proof
              <textarea
                value={walletProof}
                onChange={(event) => setWalletProof(event.target.value)}
                required
              />
            </label>
            <button className="button button-secondary" type="submit">
              Verify wallet
            </button>
          </form>
          <form className="settings-card" onSubmit={handleConnectChannel}>
            <h2>Social channels</h2>
            <label>
              Platform
              <select
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
              >
                <option>X</option>
                <option>Discord</option>
                <option>Telegram</option>
              </select>
            </label>
            <label>
              Provider authorization code
              <input
                value={authorizationCode}
                onChange={(event) => setAuthorizationCode(event.target.value)}
                required
              />
            </label>
            <button className="button button-secondary" type="submit">
              Connect channel
            </button>
            <label>
              Verification challenge response
              <input
                value={verificationChallenge}
                onChange={(event) =>
                  setVerificationChallenge(event.target.value)
                }
                placeholder="Provider challenge response"
              />
            </label>
            <div className="channel-list">
              {channels.map((channel) => (
                <div key={channel.platform}>
                  <span>
                    {channel.platform}{" "}
                    {channel.verified ? "✓ verified" : "pending"}
                  </span>
                  <span>
                    <button
                      type="button"
                      disabled={!verificationChallenge}
                      onClick={async () => {
                        await verifySocialChannel(
                          user.userId,
                          channel.platform,
                          verificationChallenge,
                        );
                        setChannels(await getSocialChannels(user.userId));
                        setVerificationChallenge("");
                      }}
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await disconnectSocialChannel(
                          user.userId,
                          channel.platform,
                        );
                        setChannels(await getSocialChannels(user.userId));
                      }}
                    >
                      Disconnect
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </form>
          <section className="settings-card danger-card">
            <h2>Deactivate account</h2>
            <p>
              This disables the profile. It does not expose or delete private
              verification evidence from the browser.
            </p>
            <button
              className="button button-error"
              type="button"
              onClick={async () => {
                if (window.confirm("Deactivate your MemeTokenHub account?")) {
                  await deactivateUser(user.userId);
                  await logout();
                }
              }}
            >
              Deactivate account
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

export function RoleAdministrationPage() {
  const { status, user } = useAuth();
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("Fan");
  const [message, setMessage] = useState("");
  const canManageRoles =
    user?.capabilities?.includes("users:roles:write") || user?.role === "Admin";
  if (status !== "authenticated" || !canManageRoles)
    return (
      <main className="auth-page page-shell">
        <section className="auth-panel">
          <ShieldCheck />
          <h1>Administrator access required.</h1>
          <p>
            Moderators cannot self-grant privileges or assign Moderator.
            Elevated role administration is reserved for the Admin policy.
          </p>
        </section>
      </main>
    );
  return (
    <main className="auth-page page-shell">
      <form
        className="auth-panel"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await updateUserRole(userId, role);
            setMessage("Role updated.");
          } catch (error) {
            setMessage(
              error instanceof Error ? error.message : "Update failed.",
            );
          }
        }}
      >
        <ShieldCheck />
        <h1>Role administration</h1>
        <label>
          User ID
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            required
          />
        </label>
        <label>
          Role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option>Fan</option>
            <option>KOL</option>
            <option>Developer</option>
          </select>
        </label>
        <button className="button button-primary" type="submit">
          Update role
        </button>
        {message && <StatusMessage message={message} />}
      </form>
    </main>
  );
}
