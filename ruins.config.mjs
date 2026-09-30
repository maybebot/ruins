import { commits, defineConfig, lint, todo } from "./dist/index.js";

export default defineConfig({
  dir: ".ruins/",
  modules: [commits(), lint(), todo()],
});
