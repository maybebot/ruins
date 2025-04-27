import { exec } from "child_process";
import { writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { getConfig } from "../config/getConfig.js";
import { resolve } from "node:path";
import consola from "consola";
import type { RuinsOutput } from "../types/ruins.js";

const execPromise = promisify(exec);

export const customOccurances = async (searchString: string, file: string) => {
  const settings = await getConfig();
  const outputFile = resolve(settings.dir, `${file}.json`);

  try {
    const grepOutput = await execPromise(`cd ${process.cwd()} && git grep -rn "${searchString}" *`);
    const formattedOutput = grepOutput.stdout.split(/\r?\n/).filter(Boolean);

    const output: RuinsOutput<any> = {
      meta: {
        timestamp: Date.now(),
      },
      data: formattedOutput,
    };

    await writeFile(outputFile, JSON.stringify(output, null, 2));
  } catch {
    consola.error("Something went wrong!");
  }
};
