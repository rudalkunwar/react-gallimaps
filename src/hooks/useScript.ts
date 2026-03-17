import { useEffect, useMemo, useState } from "react";
import { ScriptStatus } from "../types";

/**
 * Safe script loader hook with SSR guard and duplicate detection.
 */
export const useScript = (src: string): ScriptStatus => {
  const [status, setStatus] = useState<ScriptStatus>("idle");

  // Stable handler refs per hook instance
  const handlers = useMemo(() => {
    const onEvent = (event: Event) => {
      const newStatus = event.type === "load" ? "ready" : "error";
      if (event.target && (event.target as HTMLElement).setAttribute) {
        (event.target as HTMLElement).setAttribute("data-status", newStatus);
      }
      setStatus(newStatus as ScriptStatus);
    };
    return { onEvent };
  }, []);

  useEffect(() => {
    // SSR guard
    if (typeof document === "undefined") {
      setStatus("idle");
      return;
    }

    if (!src) {
      setStatus("error");
      return;
    }

    let script = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-status", "loading");
      document.body.appendChild(script);
      setStatus("loading");
      script.addEventListener("load", handlers.onEvent);
      script.addEventListener("error", handlers.onEvent);
    } else {
      const currentStatus = (script.getAttribute("data-status") as ScriptStatus) || "ready";
      setStatus(currentStatus);
      // ensure listeners exist to update this hook instance if status changes later
      script.addEventListener("load", handlers.onEvent);
      script.addEventListener("error", handlers.onEvent);
    }

    return () => {
      if (script) {
        script.removeEventListener("load", handlers.onEvent);
        script.removeEventListener("error", handlers.onEvent);
      }
    };
  }, [src, handlers]);

  return status;
};
