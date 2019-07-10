import { useState, useCallback } from "react";
export function useControlledUncontrolled(
  value: string,
  onChange: (value: string) => void
): [string, () => void, (s: string) => void] {
  const [cache, setCache] = useState("");

  const handleCommit = useCallback(() => {
    onChange(cache);
    setCache("");
  }, [onChange, setCache, cache]);

  const handleCacheChange = useCallback(
    (newValue: string) => setCache(newValue),
    [setCache]
  );

  const out = cache || value;
  return [out, handleCommit, handleCacheChange];
}
