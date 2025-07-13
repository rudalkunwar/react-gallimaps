import { loadScript } from "../src/utils/loadScript";

describe("loadScript Utility", () => {
  beforeEach(() => {
    // Clear any existing GalliMapPlugin
    delete (window as any).GalliMapPlugin;
    jest.clearAllMocks();
  });

  it("should resolve immediately if GalliMapPlugin already exists", async () => {
    (window as any).GalliMapPlugin = {};
    await expect(loadScript("test-url")).resolves.toBeUndefined();
  });

  it("should create and load script element", async () => {
    const scriptUrl = "https://example.com/script.js";

    // Ensure GalliMapPlugin doesn't exist
    delete (window as any).GalliMapPlugin;

    // Create a real script element to use as mock
    const mockScript = document.createElement("script");
    const createElementSpy = jest
      .spyOn(document, "createElement")
      .mockReturnValue(mockScript);
    const appendChildSpy = jest
      .spyOn(document.head, "appendChild")
      .mockImplementation(() => mockScript);

    // Start loading
    const loadPromise = loadScript(scriptUrl);

    // Verify script was created and configured
    expect(createElementSpy).toHaveBeenCalledWith("script");
    expect(mockScript.src).toBe(scriptUrl);
    expect(mockScript.async).toBe(true);
    expect(appendChildSpy).toHaveBeenCalledWith(mockScript);

    // Simulate successful load
    if (mockScript.onload) {
      mockScript.onload(new Event("load"));
    }

    await expect(loadPromise).resolves.toBeUndefined();

    // Cleanup
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
  });
});
