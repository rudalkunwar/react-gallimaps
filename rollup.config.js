import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

/** Development build configuration with source maps */
export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      exports: "named",
      sourcemap: true,
      globals: {
        react: "React",
        "react-dom": "ReactDOM",
        "react/jsx-runtime": "jsxRuntime",
      },
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  /** Externalize React dependencies to prevent bundling */
  external: (id) => {
    return (
      id === "react" ||
      id === "react-dom" ||
      id.startsWith("react/") ||
      id.startsWith("react-dom/")
    );
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs({
      include: /node_modules/,
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      exclude: ["**/*.test.*", "tests/**/*"],
      declaration: true,
      declarationMap: true,
    }),
    terser({
      compress: {
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ["console.log"],
        passes: 2,
      },
      mangle: {
        reserved: ["React", "ReactDOM"],
      },
      format: {
        comments: false,
      },
    }),
  ],
};
