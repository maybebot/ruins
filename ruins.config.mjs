import { commits, defineConfig, lint, todo } from "./dist/index.mjs";

export default defineConfig({
  dir: ".ruins/",
  modules: [commits(), lint(), todo()],
});
