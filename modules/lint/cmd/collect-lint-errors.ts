import { RuinsConfigInternal } from "@ruins/config";
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { consola } from "consola";
import { execSync } from "child_process";
import { LintSettings } from "../index.js";
import { transformIntoLintIgnores } from "../transformers/errors.js";
import { EslintIgnoreByFile, RuinsEslintOutput } from "../transformers/types.js";

// TODO: support oxlint
export const collectLintErrors = (settings: LintSettings, config: RuinsConfigInternal) => {
  const issuesFilePath = resolve(config.dir, "lint-issues.json");
  const ignoresFilePath = resolve(config.dir, "lint-ignores.js");

  consola.info(`Searching for linting issues`);

  // TODO: check for eslint/oxlint existance, files, etc.

  return async () => {
    // a reset is necessary for the linter to catch existing errors
    await resetExistingIgnores(ignoresFilePath);

    // an issue file for the ui or analyzing data
    writeIssuesFile(issuesFilePath, config._paths.ruins, config._paths.bin);

    // a js file eslint can use as ignores/downgrades of errors in files
    const issues = await readLintIssuesFile(config, "lint-issues.json");
    const ignores = transformIntoLintIgnores(issues, settings.preferOff ?? false, false);
    await writeIgnoresFile(ignoresFilePath, ignores);
  };
};

/**
 * Eslint ignores need to be removed before trying to catch them again
 */
const resetExistingIgnores = async (ignoresFile: string) => {
  if (existsSync(ignoresFile)) {
    const resetConent = `export const ruinsIgnores = [];`;
    await writeFile(ignoresFile, resetConent);
  }
};

/**
 * Creates a /.ruins/lint-issues.json file
 */
const writeIssuesFile = (outputFile: string, ruinsPath: string, binPath: string) => {
  try {
    // TODO: resolve this, it cannot point at random-ish file like this
    execSync(
      `${binPath}/eslint --quiet -o ${outputFile} -f ${ruinsPath}/dist/modules/lint/transformers/output.js`,
    );
    consola.success(`Collected issues in ${outputFile}`);
  } catch {
    // It always has a non-zero exit code
  }
};

const writeIgnoresFile = async (ignoresFilePath: string, ignores: EslintIgnoreByFile) => {
  await writeFile(
    ignoresFilePath,
    `export const ruinsIgnores = ${JSON.stringify(ignores, null, 2)}`,
  );
};

/**
 * Reads issues file
 */
const readLintIssuesFile = async (config: RuinsConfigInternal, filename: string) => {
  const pathToFile = resolve(process.cwd(), config.dir, filename);
  const { default: data } = await import(pathToFile, {
    with: { type: "json" },
  });
  return data as RuinsEslintOutput;
};
