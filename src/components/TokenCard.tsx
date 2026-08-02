import { ArrowUpRight, BadgeCheck, Flame, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { MemeToken } from "../types";

interface TokenCardProps {
  token: MemeToken;
}

export function TokenCard({ token }: TokenCardProps) {
  return (
    <article className="token-card">
      <div
        className="token-art"
        style={
          {
            "--token-from": token.colors[0],
            "--token-to": token.colors[1],
          } as React.CSSProperties
        }
      >
        <span className="token-status">
          <Flame size={13} fill="currentColor" /> {token.status}
        </span>
        <span
          className="token-mascot"
          role="img"
          aria-label={`${token.name} mascot`}
        >
          {token.mascot}
        </span>
        <span className="network-pill">{token.network}</span>
      </div>
      <div className="token-content">
        <div className="token-title-row">
          <div>
            <h3>
              {token.name}{" "}
              <BadgeCheck
                size={17}
                className="verified-icon"
                aria-label="Verified"
              />
            </h3>
            <p className="symbol">${token.symbol}</p>
          </div>
          <div
            className={
              token.change >= 0
                ? "price-change positive"
                : "price-change negative"
            }
          >
            {token.change >= 0 ? "+" : ""}
            {token.change}%
          </div>
        </div>
        <p className="token-description">{token.description}</p>
        <div className="token-stats">
          <div>
            <span>Price</span>
            <strong>{token.price}</strong>
          </div>
          <div>
            <span>Market cap</span>
            <strong>{token.marketCap}</strong>
          </div>
          <div>
            <span>
              <Users size={13} /> Community
            </span>
            <strong>{token.supporters}</strong>
          </div>
        </div>
        <div className="sentiment-row">
          <div className="sentiment-label">
            <span>Community vibe</span>
            <strong>{token.sentiment}% hot</strong>
          </div>
          <div className="sentiment-track">
            <span style={{ width: `${token.sentiment}%` }} />
          </div>
        </div>
        <Link className="card-link" to={`/token/${token.id}`}>
          Explore project <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}
