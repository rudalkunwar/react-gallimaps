import "@testing-library/jest-dom";

// Mock window.GalliMapPlugin for component tests, but allow tests to override it
(global as any).window = global as any;

// Don't set GalliMapPlugin by default - let each test control it
// The tests that need it (like GalliMap component tests) will set it explicitly

// Suppress React act warnings for tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: An update to")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
