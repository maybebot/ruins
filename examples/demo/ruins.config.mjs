import { codeowners, lint, todo } from "ruins";

export default {
  modules: [lint(), todo(), codeowners()],
  group: { dirs: ["src/"] },
};
