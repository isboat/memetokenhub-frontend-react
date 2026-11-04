import { useCallback, useEffect, useState } from "react";
import { listHub, type HubEntry, type HubKind } from "./api";
export function useHub<T>(kind: HubKind) {
  const [entries, setEntries] = useState<HubEntry<T>[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true);
    setError("");
    return listHub<T>(kind)
      .then(setEntries)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Could not load records."),
      )
      .finally(() => setLoading(false));
  }, [kind]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { entries, error, loading, reload };
}
