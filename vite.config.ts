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
      name: "MuiPhoneNumber",
      fileName: "index",
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "@mui/material",
        "@mui/material/TextField",
        "@mui/material/InputAdornment",
        "@mui/material/IconButton",
        "@mui/material/Menu",
        "@mui/material/Divider",
        "@mui/material/NativeSelect",
        "@mui/material/MenuItem",
        "@emotion/react",
        "@emotion/styled",
        "country-flag-icons",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@mui/material": "MUI",
          "@mui/material/TextField": "MUI.TextField",
          "@mui/material/InputAdornment": "MUI.InputAdornment",
          "@mui/material/IconButton": "MUI.IconButton",
          "@mui/material/Menu": "MUI.Menu",
          "@mui/material/Divider": "MUI.Divider",
          "@mui/material/NativeSelect": "MUI.NativeSelect",
          "@mui/material/MenuItem": "MUI.MenuItem",
          "@emotion/react": "emotionReact",
          "@emotion/styled": "emotionStyled",
          "country-flag-icons": "CountryFlagIcons",
        },
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
