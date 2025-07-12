import {
  validateCoordinates,
  validateAccessToken,
  validateSearchWord,
  validateTransportMode,
  sanitizeInput,
  isValidUrl,
  validateTimeout,
} from "../validation";
import { GalliMapsError } from "../../types";

describe("Validation Utils", () => {
  describe("validateCoordinates", () => {
    it("should pass for valid coordinates", () => {
      expect(() => validateCoordinates(27.7172, 85.324)).not.toThrow();
      expect(() => validateCoordinates(-90, -180)).not.toThrow();
      expect(() => validateCoordinates(90, 180)).not.toThrow();
    });

    it("should throw for invalid latitude", () => {
      expect(() => validateCoordinates(91, 0)).toThrow(GalliMapsError);
      expect(() => validateCoordinates(-91, 0)).toThrow(GalliMapsError);
      expect(() => validateCoordinates(NaN, 0)).toThrow(GalliMapsError);
      expect(() => validateCoordinates(Infinity, 0)).toThrow(GalliMapsError);
    });

    it("should throw for invalid longitude", () => {
      expect(() => validateCoordinates(0, 181)).toThrow(GalliMapsError);
      expect(() => validateCoordinates(0, -181)).toThrow(GalliMapsError);
      expect(() => validateCoordinates(0, NaN)).toThrow(GalliMapsError);
      expect(() => validateCoordinates(0, Infinity)).toThrow(GalliMapsError);
    });
  });

  describe("validateAccessToken", () => {
    it("should pass for valid token", () => {
      expect(() => validateAccessToken("valid-token")).not.toThrow();
      expect(() => validateAccessToken("token with spaces")).not.toThrow();
    });

    it("should throw for invalid token", () => {
      expect(() => validateAccessToken("")).toThrow(GalliMapsError);
      expect(() => validateAccessToken("   ")).toThrow(GalliMapsError);
      expect(() => validateAccessToken(null as any)).toThrow(GalliMapsError);
      expect(() => validateAccessToken(undefined as any)).toThrow(
        GalliMapsError
      );
    });
  });

  describe("validateSearchWord", () => {
    it("should pass for valid search word", () => {
      expect(() => validateSearchWord("kathmandu")).not.toThrow();
      expect(() => validateSearchWord("test", 3)).not.toThrow();
    });

    it("should throw for invalid search word", () => {
      expect(() => validateSearchWord("")).toThrow(GalliMapsError);
      expect(() => validateSearchWord("ab", 3)).toThrow(GalliMapsError);
      expect(() => validateSearchWord(null as any)).toThrow(GalliMapsError);
    });
  });

  describe("validateTransportMode", () => {
    it("should return true for valid transport modes", () => {
      expect(validateTransportMode("driving")).toBe(true);
      expect(validateTransportMode("walking")).toBe(true);
      expect(validateTransportMode("cycling")).toBe(true);
    });

    it("should return false for invalid transport modes", () => {
      expect(validateTransportMode("flying")).toBe(false);
      expect(validateTransportMode("")).toBe(false);
      expect(validateTransportMode("DRIVING")).toBe(false);
    });
  });

  describe("sanitizeInput", () => {
    it("should remove dangerous characters", () => {
      expect(sanitizeInput("<script>alert()</script>")).toBe(
        "scriptalert()/script"
      );
      expect(sanitizeInput("normal text")).toBe("normal text");
      expect(sanitizeInput("  trimmed  ")).toBe("trimmed");
    });
  });

  describe("isValidUrl", () => {
    it("should return true for valid URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://localhost:3000")).toBe(true);
      expect(isValidUrl("https://api.example.com/v1")).toBe(true);
    });

    it("should return false for invalid URLs", () => {
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("")).toBe(false);
      expect(isValidUrl("ftp://example.com")).toBe(true); // FTP is still a valid URL
    });
  });

  describe("validateTimeout", () => {
    it("should pass for valid timeout values", () => {
      expect(() => validateTimeout(1000)).not.toThrow();
      expect(() => validateTimeout(30000)).not.toThrow();
      expect(() => validateTimeout(300000)).not.toThrow();
    });

    it("should throw for invalid timeout values", () => {
      expect(() => validateTimeout(0)).toThrow(GalliMapsError);
      expect(() => validateTimeout(-1000)).toThrow(GalliMapsError);
      expect(() => validateTimeout(400000)).toThrow(GalliMapsError);
      expect(() => validateTimeout(NaN)).toThrow(GalliMapsError);
      expect(() => validateTimeout(Infinity)).toThrow(GalliMapsError);
    });
  });
});
