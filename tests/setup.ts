import "@testing-library/jest-dom";

// Mock GalliMaps global
declare global {
  namespace NodeJS {
    interface Global {
      GalliMapPlugin: any;
    }
  }
}

// Mock window.GalliMapPlugin
Object.defineProperty(window, "GalliMapPlugin", {
  value: jest.fn().mockImplementation((options) => ({
    displayPinMarker: jest.fn(),
    removePinMarker: jest.fn(),
    autoCompleteSearch: jest.fn().mockResolvedValue([]),
    searchData: jest.fn(),
    drawPolygon: jest.fn(),
    removePolygon: jest.fn(),
    options,
  })),
  writable: true,
});

// Store original createElement to avoid stack overflow
const originalCreateElement = document.createElement.bind(document);

// Mock script loading
Object.defineProperty(document, "createElement", {
  value: jest.fn().mockImplementation((tagName) => {
    if (tagName === "script") {
      const script = {
        src: "",
        async: false,
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
      };

      // Simulate successful script loading
      setTimeout(() => {
        if (script.onload) {
          script.onload();
        }
      }, 0);

      return script;
    }
    return originalCreateElement(tagName);
  }),
  writable: true,
});

// Mock document.head.appendChild
Object.defineProperty(document.head, "appendChild", {
  value: jest.fn(),
  writable: true,
});
