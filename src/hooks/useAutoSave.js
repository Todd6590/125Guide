import { useEffect, useRef, useState } from "react";

/**
 * Debounced auto-save hook.
 * @param {function} saveFn - async function to call with the latest data
 * @param {object} data - the data to save
 * @param {number} delay - debounce delay in ms (default 1500)
 * @param {boolean} enabled - whether auto-save is active
 */
export function useAutoSave(saveFn, data, delay = 1500, enabled = true) {
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const timerRef = useRef(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!enabled) return;
    // Skip the very first render (don't auto-save on mount)
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setStatus("saving");
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await saveFn(data);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("error");
      }
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [JSON.stringify(data), enabled]);

  return status;
}