import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      tsconfigPath: "./tsconfig.json",
      exclude: ["**/*.test.tsx", "demo/**/*"],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: (id: string): boolean => {
        // Externalize all peer dependencies and their subpaths so that the
        // host app's single instances of React, MUI, and Emotion are used
        // at runtime.  This prevents bundling @mui/system, @mui/styled-engine,
        // @mui/material/SvgIcon, etc. which would create a duplicate default
        // theme and break dark-mode in consuming apps.
        return (
          /^react(-dom)?(\/|$)/.test(id) ||
          /^@mui\//.test(id) ||
          /^@emotion\//.test(id) ||
          /^country-flag-icons(\/|$)/.test(id)
        );
      },
    },
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
