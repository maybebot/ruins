import { getLintResults } from "../utils/getLintResults";
import consola from "consola";

export default defineCachedEventHandler(
  async (event) => {
    const issues = await getLintResults();
    if (!issues) {
      consola.error("Lint file not found, did you generate ruins-lint.json?");
      return;
    }
    return issues;
  },
  { maxAge: 10 /* 10 sec */ }
);
