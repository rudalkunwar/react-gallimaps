import { useGallimaps } from "../context/GallimapsContext";
import type { GalliApiClient } from "../api/client";

/**
 * Returns the {@link GalliApiClient} provided to `<GallimapsProvider>`.
 *
 * Throws if the provider was not given an `accessToken` or `client`, so the
 * REST hooks can rely on a non-null client.
 */
export const useGalliClient = (): GalliApiClient => {
  const { apiClient } = useGallimaps();
  if (!apiClient) {
    throw new Error(
      "No GalliMaps REST client found. Pass `accessToken` (or `client`) to " +
        "<GallimapsProvider> to use REST API hooks.",
    );
  }
  return apiClient;
};

/** Like {@link useGalliClient} but returns `null` instead of throwing. */
export const useOptionalGalliClient = (): GalliApiClient | null =>
  useGallimaps().apiClient;
