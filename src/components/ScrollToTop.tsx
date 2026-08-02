import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Restores expected document position after client-side route navigation. */
export function ScrollToTop() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      let targetId = hash.slice(1);
      try {
        targetId = decodeURIComponent(targetId);
      } catch {
        // A malformed fragment cannot identify an element; fall back to top.
      }
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [hash, pathname]);

  return null;
}
