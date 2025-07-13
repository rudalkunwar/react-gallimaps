import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const isProduction = process.env.NODE_ENV === "production";

export default {
  input: "src/index.tsx",
  output: [
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      exports: "named",
      sourcemap: !isProduction,
      globals: {
        react: "React",
        "react-dom": "ReactDOM",
        "react/jsx-runtime": "jsxRuntime",
      },
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: !isProduction,
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
      declaration: true,
      declarationMap: !isProduction,
    }),
    terser({
      compress: {
        drop_console: isProduction,
        drop_debugger: true,
        pure_funcs: isProduction ? ["console.log", "console.warn"] : [],
        passes: isProduction ? 3 : 2,
        unsafe: isProduction,
        unsafe_comps: isProduction,
        unsafe_math: isProduction,
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
