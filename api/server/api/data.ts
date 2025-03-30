import { getLintIssues } from "../../../config/getLintIssues";
import consola from "consola";

export default defineCachedEventHandler(
  async () => {
    const issues = await getLintIssues();
    if (!issues) {
      consola.error("Lint file not found, did you generate ruins-lint.json?");
      return;
    }
    return issues;
  },
  { maxAge: 10 /* 10 sec */ }
);
