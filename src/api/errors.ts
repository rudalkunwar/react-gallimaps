/** Extra context attached to a {@link GalliApiError}. */
export interface GalliApiErrorDetails {
  /** HTTP status code, when the failure came from a response. */
  status?: number;
  /** Machine-readable code (e.g. `"ABORTED"`, `"NETWORK"`, `"PARSE"`). */
  code?: string;
  /** The requested URL, with the access token redacted. */
  url?: string;
  /** The parsed (or raw) response body, when available. */
  body?: unknown;
  /** The underlying error, when this wraps another failure. */
  cause?: unknown;
}

/**
 * Error thrown by {@link GalliApiClient} for any non-successful request:
 * network failures, non-2xx responses, unparseable bodies, or a
 * `{ success: false }` payload from GalliMaps.
 */
export class GalliApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly url?: string;
  readonly body?: unknown;

  constructor(message: string, details: GalliApiErrorDetails = {}) {
    super(message);
    this.name = "GalliApiError";
    this.status = details.status;
    this.code = details.code;
    this.url = details.url;
    this.body = details.body;
    if (details.cause !== undefined) {
      (this as { cause?: unknown }).cause = details.cause;
    }
    // Restore the prototype chain when compiled down to ES5.
    Object.setPrototypeOf(this, GalliApiError.prototype);
  }
}

/** Narrow an unknown value to a {@link GalliApiError}. */
export const isGalliApiError = (value: unknown): value is GalliApiError =>
  value instanceof GalliApiError;
