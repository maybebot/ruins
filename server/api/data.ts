import { EslintOutput } from "../types/eslint";
import { getLintResults } from "#imports";

interface DataRes {
  issues: EslintOutput[];
}

export default defineCachedEventHandler(
  async (event): Promise<DataRes> => {
    const lint = (await getLintResults()) as DataRes;
    return lint;
  },
  { maxAge: 10 /* 10 sec */ }
);
