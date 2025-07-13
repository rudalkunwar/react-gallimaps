import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.tsx",
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
    }),
    terser(),
  ],
};
