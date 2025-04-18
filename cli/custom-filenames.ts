import { exec } from "child_process";
import { writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { getConfig } from "../config/getConfig.js";
import { resolve } from "node:path";
import consola from "consola";
import type { RuinsOutput } from "../types/ruins.js";

const execPromise = promisify(exec);
// TODO(created=2023-10-12): add stacked/comparison option

export const customFilenames = async (searchString: string, file: string) => {
  const settings = await getConfig();
  const outputFile = resolve(settings.dir, `${file}.json`);

  try {
    const allFiles = await execPromise(`cd ${process.cwd()} && git ls-files`);
    const files = allFiles.stdout.split(/\r?\n/).filter(Boolean);
    const filteredFiles = files.filter((f) => f.includes(searchString));

    const output: RuinsOutput<string[]> = {
      meta: {
        timestamp: Date.now(),
      },
      data: filteredFiles,
    };

    await writeFile(outputFile, JSON.stringify(output, null, 2));
  } catch {
    consola.error("Something went wrong!");
  }
};
