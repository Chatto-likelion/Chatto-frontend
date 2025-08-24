// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import svgr from "vite-plugin-svgr";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    host: true, // 0.0.0.0 바인딩 → 외부 접근 가능
    port: 5173, // 필요 시 다른 포트도 OK (SG 열기 잊지 말기)
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000", // 같은 EC2에서 도는 Django
        changeOrigin: true,
        // 필요 시 path rewrite가 있으면 여기에 추가
        // rewrite: (p) => p.replace(/^\/api/, "/api"),
      },
    },
  },
});
