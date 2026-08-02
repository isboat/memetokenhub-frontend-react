import { Menu, Search, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const navigationItems = [
  { label: "Discover", to: "/" },
  { label: "Community", to: "/community" },
  { label: "Learn", to: "/learn" },
];

export function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="site-header">
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
          <button
            className="icon-button search-button"
            type="button"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <Link className="button button-primary compact" to="/dashboard">
            Join the hub
          </Link>
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
