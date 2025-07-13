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
    const scriptUrl = "https://example.com/script.js";
    const mockScript = document.createElement('script');
    
    // Mock document.createElement
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockScript);
    const appendChildSpy = jest.spyOn(document.head, 'appendChild').mockImplementation(() => mockScript);
    
    const loadPromise = loadScript(scriptUrl);

    // Verify script properties are set
    expect(createElementSpy).toHaveBeenCalledWith('script');
    expect(mockScript.src).toBe(scriptUrl);
    expect(mockScript.async).toBe(true);
    expect(appendChildSpy).toHaveBeenCalledWith(mockScript);

    // Simulate successful load
    if (mockScript.onload) {
      mockScript.onload(new Event('load'));
    }

    await expect(loadPromise).resolves.toBeUndefined();

    // Cleanup
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
  });
});
