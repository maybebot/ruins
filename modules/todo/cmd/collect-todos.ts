import type { RuinsConfigInternal } from "@ruins/config";
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { log } from "@clack/prompts";
import type { RuinsTodoEntry, RuinsTodoOutput } from "../transformers/types.js";

const todosFilename = "todos.json";

export const collectTodos = async (config: RuinsConfigInternal) => {
  const outputFilePath = resolve(config._paths.ruinsDir, todosFilename);
  await mkdir(config._paths.ruinsDir, { recursive: true });
  log.info("Searching for TODO comments");

  const output: RuinsTodoOutput = {
    meta: { timestamp: Date.now() },
    data: getTodoEntries(config._paths.cwd),
  };
  await writeFile(outputFilePath, JSON.stringify(output, null, 2));
  log.success(`Collected TODOs in ${outputFilePath}`);
};

const getTodoEntries = (cwd: string): RuinsTodoEntry[] => {
  let grepOutput: string;
  try {
    grepOutput = execFileSync("git", ["grep", "-rn", "// TODO"], {
      cwd,
      encoding: "utf8",
    });
  } catch (error) {
    // git grep exits with status 1 when there are no matches
    if (typeof error === "object" && error !== null && "status" in error && error.status === 1) {
      return [];
    }
    log.error(
      `Could not search for TODOs: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }

  return grepOutput
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const file = line.split(":")[0];
      const todo = line.split("//")[1];
      return todo ? { file, todo: `//${todo}` } : undefined;
    })
    .filter((entry): entry is RuinsTodoEntry => entry !== undefined);
};
