import { useState, useEffect } from "react";
import { ScriptStatus } from "../types";

export const useScript = (src: string): ScriptStatus => {
  const [status, setStatus] = useState<ScriptStatus>("idle");

  useEffect(() => {
    if (!src) {
      setStatus("error");
      return;
    }

    // Prevent duplicate script loading
    let script = document.querySelector(
      `script[src="${src}"]`
    ) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-status", "loading");
      document.body.appendChild(script);
      setStatus("loading");

      // Add event handlers
      const setAttributeFromEvent = (event: Event) => {
        const newStatus = event.type === "load" ? "ready" : "error";
        script.setAttribute("data-status", newStatus);
        setStatus(newStatus as ScriptStatus);
      };

      script.addEventListener("load", setAttributeFromEvent);
      script.addEventListener("error", setAttributeFromEvent);
    } else {
      setStatus(
        (script.getAttribute("data-status") as ScriptStatus) || "ready"
      );
    }

    const cleanup = () => {
      if (script) {
        script.removeEventListener("load", setStatus as any);
        script.removeEventListener("error", setStatus as any);
      }
    };

    return cleanup;
  }, [src]);

  return status;
};
