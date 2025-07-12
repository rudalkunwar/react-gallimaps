import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import {
  AutocompleteParams,
  AutocompleteResponse,
  SearchParams,
  SearchResponse,
  ReverseGeocodingParams,
  ReverseGeocodingResponse,
  RoutingParams,
  RoutingResponse,
  DistanceParams,
  DistanceResponse,
  GalliMapsConfig,
  GalliMapsError,
} from "../types";
import {
  validateCoordinates,
  validateAccessToken,
  validateSearchWord,
  validateTransportMode,
  sanitizeInput,
  isValidUrl,
  validateTimeout,
} from "../utils/validation";

export class GalliMapsClient {
  private client: AxiosInstance;
  private config: GalliMapsConfig;

  constructor(config: GalliMapsConfig) {
    // Validate configuration
    validateAccessToken(config.accessToken);

    if (config.baseUrl && !isValidUrl(config.baseUrl)) {
      throw new GalliMapsError("Invalid base URL provided");
    }

    if (config.timeout) {
      validateTimeout(config.timeout);
    }

    this.config = {
      baseUrl: "https://route-init.gallimap.com/api/v1",
      timeout: 10000,
      retries: 3,
      ...config,
    };

    const axiosConfig: any = {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "GalliMaps-React-SDK/1.0.0",
      },
    };

    if (this.config.baseUrl) {
      axiosConfig.baseURL = this.config.baseUrl;
    }

    if (this.config.timeout) {
      axiosConfig.timeout = this.config.timeout;
    }

    this.client = axios.create(axiosConfig);

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for logging and request modification
    this.client.interceptors.request.use(
      (config) => {
        // Add timestamp for request tracking
        (config as any).metadata = { startTime: Date.now() };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and retries
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response time in development
        if (
          process.env.NODE_ENV === "development" &&
          (response.config as any).metadata
        ) {
          const duration =
            Date.now() - (response.config as any).metadata.startTime;
          console.debug(`GalliMaps API request completed in ${duration}ms`);
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response) {
          const status = error.response.status;
          const data = error.response.data as any;

          // Handle specific error cases
          if (status === 401) {
            throw new GalliMapsError(
              "Invalid access token",
              status,
              "INVALID_TOKEN",
              { originalError: data }
            );
          } else if (status === 429) {
            throw new GalliMapsError(
              "Rate limit exceeded. Please try again later.",
              status,
              "RATE_LIMIT_EXCEEDED",
              { retryAfter: error.response.headers["retry-after"] }
            );
          } else if (status >= 500 && status < 600) {
            // Server errors - implement retry logic
            if (
              !originalRequest._retry &&
              this.config.retries &&
              originalRequest._retryCount < this.config.retries
            ) {
              originalRequest._retry = true;
              originalRequest._retryCount =
                (originalRequest._retryCount || 0) + 1;

              // Exponential backoff
              const delay = Math.pow(2, originalRequest._retryCount) * 1000;
              await new Promise((resolve) => setTimeout(resolve, delay));

              return this.client(originalRequest);
            }

            throw new GalliMapsError(
              "Server error occurred. Please try again later.",
              status,
              "SERVER_ERROR",
              { retryCount: originalRequest._retryCount || 0 }
            );
          }

          throw new GalliMapsError(
            data?.message || "API request failed",
            status,
            data?.code,
            { originalError: data }
          );
        } else if (error.request) {
          throw new GalliMapsError(
            "Network error - no response received. Please check your internet connection.",
            undefined,
            "NETWORK_ERROR"
          );
        } else {
          throw new GalliMapsError(
            `Request error: ${error.message}`,
            undefined,
            "REQUEST_ERROR"
          );
        }
      }
    );
  }

  /**
   * Get autocomplete suggestions based on user input
   */
  async autocomplete(
    params: Omit<AutocompleteParams, "accessToken">
  ): Promise<AutocompleteResponse> {
    const { word, lat, lng } = params;

    // Validate inputs
    validateSearchWord(word, 3);
    validateCoordinates(lat, lng);

    const sanitizedWord = sanitizeInput(word);

    try {
      const response = await this.client.get<AutocompleteResponse>(
        "/search/autocomplete",
        {
          params: {
            accessToken: this.config.accessToken,
            word: sanitizedWord,
            lat,
            lng,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof GalliMapsError) {
        throw error;
      }
      throw new GalliMapsError(
        "Failed to fetch autocomplete results",
        undefined,
        "AUTOCOMPLETE_ERROR",
        { originalError: error }
      );
    }
  }

  /**
   * Search for places using the Search API
   */
  async search(
    params: Omit<SearchParams, "accessToken">
  ): Promise<SearchResponse> {
    const { name, currentLat, currentLng } = params;

    // Validate inputs
    validateSearchWord(name, 1);
    validateCoordinates(currentLat, currentLng);

    const sanitizedName = sanitizeInput(name);

    try {
      const response = await this.client.get<SearchResponse>(
        "/search/currentLocation",
        {
          params: {
            accessToken: this.config.accessToken,
            name: sanitizedName,
            currentLat,
            currentLng,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof GalliMapsError) {
        throw error;
      }
      throw new GalliMapsError(
        "Failed to search for location",
        undefined,
        "SEARCH_ERROR",
        { originalError: error }
      );
    }
  }

  /**
   * Get location information from coordinates (Reverse Geocoding)
   */
  async reverseGeocode(
    params: Omit<ReverseGeocodingParams, "accessToken">
  ): Promise<ReverseGeocodingResponse> {
    const { lat, lng } = params;

    // Validate inputs
    validateCoordinates(lat, lng);

    try {
      const response = await this.client.get<ReverseGeocodingResponse>(
        "/reverse/generalReverse",
        {
          params: {
            accessToken: this.config.accessToken,
            lat,
            lng,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof GalliMapsError) {
        throw error;
      }
      throw new GalliMapsError(
        "Failed to reverse geocode coordinates",
        undefined,
        "REVERSE_GEOCODE_ERROR",
        { originalError: error }
      );
    }
  }

  /**
   * Get routing information between two points
   */
  async getRoute(
    params: Omit<RoutingParams, "accessToken">
  ): Promise<RoutingResponse> {
    const { mode, srcLat, srcLng, dstLat, dstLng } = params;

    // Validate inputs
    if (!validateTransportMode(mode)) {
      throw new GalliMapsError(
        "Invalid transport mode. Must be driving, walking, or cycling",
        undefined,
        "INVALID_TRANSPORT_MODE"
      );
    }
    validateCoordinates(srcLat, srcLng);
    validateCoordinates(dstLat, dstLng);

    try {
      const response = await this.client.get<RoutingResponse>("/routing", {
        params: {
          accessToken: this.config.accessToken,
          mode,
          srcLat,
          srcLng,
          dstLat,
          dstLng,
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof GalliMapsError) {
        throw error;
      }
      throw new GalliMapsError(
        "Failed to get route information",
        undefined,
        "ROUTING_ERROR",
        { originalError: error }
      );
    }
  }

  /**
   * Get distance and duration between two points
   */
  async getDistance(
    params: Omit<DistanceParams, "accessToken">
  ): Promise<DistanceResponse> {
    const { mode, srcLat, srcLng, dstLat, dstLng } = params;

    // Validate inputs
    if (!validateTransportMode(mode)) {
      throw new GalliMapsError(
        "Invalid transport mode. Must be driving, walking, or cycling",
        undefined,
        "INVALID_TRANSPORT_MODE"
      );
    }
    validateCoordinates(srcLat, srcLng);
    validateCoordinates(dstLat, dstLng);

    try {
      const response = await this.client.get<DistanceResponse>(
        "/routing/distance",
        {
          params: {
            accessToken: this.config.accessToken,
            mode,
            srcLat,
            srcLng,
            dstLat,
            dstLng,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof GalliMapsError) {
        throw error;
      }
      throw new GalliMapsError(
        "Failed to get distance information",
        undefined,
        "DISTANCE_ERROR",
        { originalError: error }
      );
    }
  }

  /**
   * Update the access token
   */
  updateAccessToken(accessToken: string): void {
    validateAccessToken(accessToken);
    this.config.accessToken = accessToken;
  }

  /**
   * Get current configuration (returns a copy to prevent mutations)
   */
  getConfig(): Readonly<GalliMapsConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Check if the client is properly configured
   */
  isConfigured(): boolean {
    try {
      validateAccessToken(this.config.accessToken);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get API health status
   */
  async healthCheck(): Promise<{ status: "ok" | "error"; timestamp: number }> {
    try {
      // Use a simple endpoint to check API availability
      await this.client.get("/health", { timeout: 5000 });
      return { status: "ok", timestamp: Date.now() };
    } catch {
      return { status: "error", timestamp: Date.now() };
    }
  }
}
