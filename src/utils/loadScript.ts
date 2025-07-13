/** Default GalliMaps script URL */
const SCRIPT_URL =
  "https://gallimap.com/static/dist/js/gallimaps.vector.min.latest.js";

/** Cached promise to prevent multiple script loads */
let loadPromise: Promise<void> | null = null;

/**
 * Loads GalliMaps script with caching to prevent duplicate requests
 * @param scriptSrc - Custom script URL (optional)
 * @returns Promise that resolves when script is loaded
 */
export const loadScript = (scriptSrc: string = SCRIPT_URL): Promise<void> => {
  if (loadPromise) return loadPromise;

  if (window.GalliMapPlugin) {
    return Promise.resolve();
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load GalliMaps script"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
};
