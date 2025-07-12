import { GalliMapsClient } from "../api/client";
import { GalliMapsError } from "../types";
import axios from "axios";

// Mock axios
jest.mock("axios", () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  })),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockAxiosInstance = {
  get: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
};

describe("GalliMapsClient", () => {
  let client: GalliMapsClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    client = new GalliMapsClient({
      accessToken: "test-token",
    });
  });

  describe("constructor", () => {
    it("should create client with default config", () => {
      const config = client.getConfig();
      expect(config.accessToken).toBe("test-token");
      expect(config.baseUrl).toBe("https://route-init.gallimap.com/api/v1");
      expect(config.timeout).toBe(10000);
      expect(config.retries).toBe(3);
    });

    it("should create client with custom config", () => {
      const customClient = new GalliMapsClient({
        accessToken: "custom-token",
        baseUrl: "https://custom-api.com",
        timeout: 5000,
        retries: 1,
      });

      const config = customClient.getConfig();
      expect(config.accessToken).toBe("custom-token");
      expect(config.baseUrl).toBe("https://custom-api.com");
      expect(config.timeout).toBe(5000);
      expect(config.retries).toBe(1);
    });
  });

  describe("updateAccessToken", () => {
    it("should update access token", () => {
      client.updateAccessToken("new-token");
      const config = client.getConfig();
      expect(config.accessToken).toBe("new-token");
    });
  });

  describe("autocomplete", () => {
    it("should throw error for short search word", async () => {
      await expect(
        client.autocomplete({ word: "ab", lat: 0, lng: 0 })
      ).rejects.toThrow("Search word must be at least 3 characters long");
    });

    it("should throw GalliMapsError for invalid word length", async () => {
      try {
        await client.autocomplete({ word: "ab", lat: 0, lng: 0 });
      } catch (error) {
        expect(error).toBeInstanceOf(GalliMapsError);
        expect(error.message).toBe(
          "Search word must be at least 3 characters long"
        );
      }
    });
  });

  describe("getRoute", () => {
    it("should throw error for invalid transport mode", async () => {
      await expect(
        client.getRoute({
          mode: "invalid" as any,
          srcLat: 0,
          srcLng: 0,
          dstLat: 1,
          dstLng: 1,
        })
      ).rejects.toThrow(
        "Invalid transport mode. Must be driving, walking, or cycling"
      );
    });

    it("should accept valid transport modes", async () => {
      // Mock successful API response
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            success: true,
            message: "Route found",
            data: [{ distance: 1000, duration: 300, latlngs: [] }],
          },
        },
      });

      await expect(
        client.getRoute({
          mode: "driving",
          srcLat: 0,
          srcLng: 0,
          dstLat: 1,
          dstLng: 1,
        })
      ).resolves.toBeDefined();

      await expect(
        client.getRoute({
          mode: "walking",
          srcLat: 0,
          srcLng: 0,
          dstLat: 1,
          dstLng: 1,
        })
      ).resolves.toBeDefined();

      await expect(
        client.getRoute({
          mode: "cycling",
          srcLat: 0,
          srcLng: 0,
          dstLat: 1,
          dstLng: 1,
        })
      ).resolves.toBeDefined();
    });
  });

  describe("getDistance", () => {
    it("should throw error for invalid transport mode", async () => {
      await expect(
        client.getDistance({
          mode: "invalid" as any,
          srcLat: 0,
          srcLng: 0,
          dstLat: 1,
          dstLng: 1,
        })
      ).rejects.toThrow(
        "Invalid transport mode. Must be driving, walking, or cycling"
      );
    });
  });
});
