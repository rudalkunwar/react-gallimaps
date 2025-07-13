import { loadScript } from "../src/utils/loadScript";

describe("loadScript Utility", () => {
  beforeEach(() => {
    // Clear any existing GalliMapPlugin
    delete (window as any).GalliMapPlugin;
    jest.clearAllMocks();
  });

  it("resolves immediately if GalliMapPlugin already exists", async () => {
    (window as any).GalliMapPlugin = {};

    await expect(loadScript("test-url")).resolves.toBeUndefined();
  });

  it("creates script element and resolves on load", async () => {
    // Mock document.createElement to return a script element
    const mockScript = {
      src: "",
      async: false,
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
    };

    const originalCreateElement = document.createElement;
    const mockAppendChild = jest.fn();

    document.createElement = jest.fn().mockImplementation((tagName) => {
      if (tagName === "script") {
        return mockScript;
      }
      return originalCreateElement.call(document, tagName);
    });

    document.head.appendChild = mockAppendChild;

    const scriptUrl = "https://example.com/script.js";
    const loadPromise = loadScript(scriptUrl);

    // Verify script properties are set
    expect(mockScript.src).toBe(scriptUrl);
    expect(mockScript.async).toBe(true);

    // Simulate successful load
    if (mockScript.onload) {
      mockScript.onload();
    }

    await expect(loadPromise).resolves.toBeUndefined();
    expect(mockAppendChild).toHaveBeenCalledWith(mockScript);

    // Cleanup
    document.createElement = originalCreateElement;
  });
});
