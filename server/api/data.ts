import { EslintOutput } from "../types/eslint";
import { getLintResults } from "#imports";
import consola from "consola";

interface DataRes {
  issues: EslintOutput[];
}

export default defineCachedEventHandler(
  async (event): Promise<DataRes> => {
    const lint = (await getLintResults()) as DataRes;
    if (!lint.issues) {
      consola.error("Lint file not found, did you generate ruins-lint.json?");
      return;
    }
    return lint;
  },
  { maxAge: 10 /* 10 sec */ }
);
