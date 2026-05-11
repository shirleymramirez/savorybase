import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiOrigin = env.API_ORIGIN || "http://localhost:5000";

  return {
    plugins: [react()],
    build: {
      minify: "esbuild",
      cssMinify: "esbuild",
      sourcemap: false,
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
          },
        },
      },
    },
    esbuild: {
      legalComments: "none",
      drop: mode === "production" ? ["debugger"] : [],
    },
    server: {
      proxy: {
        "/api": {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});
