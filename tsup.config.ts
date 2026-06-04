import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  // Dual ESM + CJS output for maximum consumer compatibility.
  format: ["esm", "cjs"],
  // Emit a single bundled type declaration alongside each format.
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Libraries ship readable code; the consuming app's bundler minifies.
  minify: false,
  // React (and its JSX runtime) is a peer dependency — never bundle it.
  external: ["react", "react-dom"],
});
