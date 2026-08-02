import { Menu, Search, Sparkles, Star, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthButton } from "./AuthButton";

const navigationItems = [
  { label: "Discover", to: "/" },
  { label: "Community", to: "/community" },
  { label: "Learn", to: "/learn" },
];

export function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="market-bar" aria-label="Sample market overview">
        <div className="market-bar-inner">
          <span className="preview-label">Demo data</span>
          <span>
            Coins <strong>2.4M+</strong>
          </span>
          <span>
            Market cap <strong>$3.42T</strong> <em>+2.8%</em>
          </span>
          <span>
            24h volume <strong>$184.6B</strong>
          </span>
          <span>
            BTC dominance <strong>58.4%</strong>
          </span>
          <span className="market-status">
            <i aria-hidden="true" /> Preview mode
          </span>
        </div>
      </div>
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="MemeTokenHub home">
          <span className="brand-mark">
            <Sparkles size={18} strokeWidth={2.5} />
          </span>
          <span>
            MemeToken<span>Hub</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              key={item.to}
              to={item.to}
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <Link className="watchlist-link" to="/dashboard">
            <Star size={17} /> <span>Watchlist</span>
          </Link>
          <Link
            className="icon-button search-button"
            to="/#trending"
            aria-label="Search"
          >
            <Search size={20} />
          </Link>
          <AuthButton />
          <button
            className="icon-button menu-button"
            type="button"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
