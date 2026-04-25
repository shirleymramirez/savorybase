import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiOrigin = env.API_ORIGIN || "http://localhost:5000";
  const apiAuthToken = env.API_AUTH_TOKEN;
  const hasUsableApiAuthToken =
    Boolean(apiAuthToken) && apiAuthToken !== "replace-with-your-local-token";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: apiOrigin,
          changeOrigin: true,
          configure: (proxy) => {
            (
              proxy as unknown as {
                on: (
                  event: string,
                  handler: (proxyReq: { setHeader: (name: string, value: string) => void }) => void,
                ) => void;
              }
            ).on("proxyReq", (proxyReq) => {
              if (hasUsableApiAuthToken && apiAuthToken) {
                proxyReq.setHeader("Authorization", `Bearer ${apiAuthToken}`);
              }
            });
          },
        },
      },
    },
  };
});
