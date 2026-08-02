import { MessageCircle, Send, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark">
              <Sparkles size={18} />
            </span>
            MemeToken<span>Hub</span>
          </Link>
          <p>
            The social home for meme-token communities. Discover boldly. Vibe
            responsibly.
          </p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link to="/">Discover</Link>
          <Link to="/community">Community</Link>
          <Link to="/learn">Learn</Link>
        </div>
        <div>
          <h3>Company</h3>
          <Link to="/about">About us</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms of use</Link>
          <Link to="/learn">Safety</Link>
          <a href="mailto:hello@memetokenhub.com">Contact</a>
        </div>
        <div>
          <h3>Your hub</h3>
          <Link to="/notifications">Notifications</Link>
          <Link to="/payments">Payments &amp; access</Link>
          <Link to="/claims">Verification</Link>
        </div>
        <div>
          <h3>Join the conversation</h3>
          <div className="social-links">
            <a href="https://x.com" aria-label="X community">
              𝕏
            </a>
            <a href="https://discord.com" aria-label="Discord">
              <MessageCircle size={18} />
            </a>
            <a href="https://telegram.org" aria-label="Telegram">
              <Send size={18} />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 MemeTokenHub. Built for the culture.</span>
        <span>Community sentiment is not financial advice.</span>
      </div>
    </footer>
  );
}
