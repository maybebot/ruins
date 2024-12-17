import { EslintOutput } from "../types/eslint";
import { getLintResults } from "#imports";

interface DataRes {
  issues: EslintOutput[];
}

export default eventHandler(async (event): Promise<DataRes> => {
  const lint = (await getLintResults()) as DataRes;
  return lint;
});
