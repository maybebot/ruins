import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), nitro()],
});
