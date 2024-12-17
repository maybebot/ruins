import { EslintOutput } from "../types/eslint";
import { getLintResults } from "#imports";

interface DataRes {
  issues: EslintOutput[];
}

export default eventHandler(async (event): Promise<DataRes> => {
  return getLintResults();
});
