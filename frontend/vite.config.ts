import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // 👈 ensures assets resolve correctly on Vercel/Netlify
  define: {
    global: "globalThis", // polyfill "global" for WalletConnect v1
  },
});
