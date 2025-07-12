import { TransportMode, GalliMapsError } from "../types";

/**
 * Validation utilities for GalliMaps library
 */

export const validateCoordinates = (lat: number, lng: number): void => {
  if (!isFinite(lat) || !isFinite(lng)) {
    throw new GalliMapsError("Coordinates must be finite numbers");
  }

  if (lat < -90 || lat > 90) {
    throw new GalliMapsError("Latitude must be between -90 and 90 degrees");
  }

  if (lng < -180 || lng > 180) {
    throw new GalliMapsError("Longitude must be between -180 and 180 degrees");
  }
};

export const validateAccessToken = (token: string): void => {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    throw new GalliMapsError(
      "Access token is required and must be a non-empty string"
    );
  }
};

export const validateSearchWord = (word: string, minLength = 1): void => {
  if (!word || typeof word !== "string") {
    throw new GalliMapsError("Search word must be a non-empty string");
  }

  if (word.trim().length < minLength) {
    throw new GalliMapsError(
      `Search word must be at least ${minLength} characters long`
    );
  }
};

export const validateTransportMode = (mode: string): mode is TransportMode => {
  const validModes: TransportMode[] = ["driving", "walking", "cycling"];
  return validModes.includes(mode as TransportMode);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateTimeout = (timeout: number): void => {
  if (!isFinite(timeout) || timeout <= 0) {
    throw new GalliMapsError("Timeout must be a positive number");
  }

  if (timeout > 300000) {
    // 5 minutes max
    throw new GalliMapsError("Timeout cannot exceed 300000ms (5 minutes)");
  }
};
