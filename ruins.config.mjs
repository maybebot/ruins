import { commits, defineConfig, lint } from "./dist/index.js";

export default defineConfig({
  dir: ".ruins/",
  modules: [commits(), lint()],
});
