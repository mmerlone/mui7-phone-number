import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const demoDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: demoDir,
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 3000,
  },
  preview: {
    host: "127.0.0.1",
    port: 3000,
  },
  build: {
    outDir: path.resolve(demoDir, "../dist-demo"),
    emptyOutDir: true,
  },
});
