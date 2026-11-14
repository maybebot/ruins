import type { RuinsConfigInternal } from "@ruins/config";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { consola } from "consola";
import type { LintSettings } from "../index.js";
import { transformIntoLintIgnores } from "../transformers/errors.js";
import formatLintOutput from "../transformers/output.js";
import type { EslintIgnoreByFile, EslintOutput, RuinsEslintOutput } from "../transformers/types.js";

const issuesFilename = "lint-issues.json";
const ignoresFilename = "lint-ignores.js";

export const collectLintErrors = async (settings: LintSettings, config: RuinsConfigInternal) => {
  const issuesFilePath = resolve(config._paths.ruinsDir, issuesFilename);
  const ignoresFilePath = resolve(config._paths.ruinsDir, ignoresFilename);
  await mkdir(config._paths.ruinsDir, { recursive: true });
  consola.info(`Searching for linting issues`);

  assertLintToolsAvailable(config._paths.bin);
  await resetExistingIgnores(ignoresFilePath);
  await writeIssuesFile(issuesFilePath, config._paths.bin);

  const issues = await readLintIssuesFile(issuesFilePath);
  const ignores = transformIntoLintIgnores(
    issues,
    settings.preferOff ?? false,
    settings.filenameOnly ?? false,
  );
  await writeIgnoresFile(ignoresFilePath, ignores);
  consola.success(`Collected issues in ${issuesFilePath}`);
  const ignoreImportPath = `./${relative(process.cwd(), ignoresFilePath).split(sep).join("/")}`;
  consola.box(
    `Import the generated ignores at the end of your eslint.config file:\n\nimport { ruinsIgnores } from "${ignoreImportPath}";\n\nexport default [...existingConfig, ...ruinsIgnores];`,
  );
};

/**
 * Eslint ignores need to be removed before trying to catch them again
 */
const resetExistingIgnores = async (ignoresFile: string) => {
  await writeFile(ignoresFile, "export const ruinsIgnores = [];\n");
};

/**
 * Creates a /.ruins/lint-issues.json file
 */
const writeIssuesFile = async (outputFile: string, binPath: string) => {
  const eslintPath = resolve(binPath, process.platform === "win32" ? "eslint.cmd" : "eslint");
  try {
    execFileSync(eslintPath, ["--quiet", "--output-file", outputFile, "--format", "json"], {
      cwd: process.cwd(),
      shell: process.platform === "win32",
      stdio: ["ignore", "ignore", "inherit"],
    });
  } catch (error) {
    if (typeof error !== "object" || error === null || !("status" in error) || error.status !== 1) {
      throw error;
    }
  }
  const eslintOutput = JSON.parse(await readFile(outputFile, "utf8")) as EslintOutput;
  await writeFile(outputFile, formatLintOutput(eslintOutput));
};

const assertLintToolsAvailable = (binPath: string) => {
  const eslintPath = resolve(binPath, process.platform === "win32" ? "eslint.cmd" : "eslint");
  if (!existsSync(eslintPath)) {
    throw new Error(
      `ESLint was not found at ${eslintPath}. Install eslint in the consuming project.`,
    );
  }
};

const writeIgnoresFile = async (ignoresFilePath: string, ignores: EslintIgnoreByFile) => {
  await writeFile(
    ignoresFilePath,
    `export const ruinsIgnores = ${JSON.stringify(ignores, null, 2)};\n`,
  );
};

const readLintIssuesFile = async (filePath: string) => {
  const contents = await readFile(filePath, "utf8");
  return JSON.parse(contents) as RuinsEslintOutput;
};
