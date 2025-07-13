import "@testing-library/jest-dom";

// Mock window.GalliMapPlugin
(global as any).window = global as any;
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
