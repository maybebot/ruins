import { lint, todo } from "ruins";

export default {
  modules: [lint(), todo()],
  group: { dirs: ["src/"] },
};
