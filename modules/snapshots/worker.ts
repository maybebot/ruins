import { readConfigAt, type RuinsConfigInternal } from "@ruins/config";
import type { SnapshotCollectorFailure } from "./types.js";

const runSnapshotCollectors = async (
  config: RuinsConfigInternal,
): Promise<SnapshotCollectorFailure[]> => {
  const failures: SnapshotCollectorFailure[] = [];
  for (const module of config.modules) {
    for (const command of module.cli?.commands ?? []) {
      if (!command.snapshotCollector) continue;
      try {
        await command.getAction(config)();
      } catch (error) {
        failures.push({
          module: module.meta.name,
          command: command.value,
          error: error instanceof Error ? error.message : String(error),
        });
        break;
      }
    }
  }
  return failures;
};

const [configSource, currentProjectDir, ruinsDir] = process.argv.slice(2);
if (
  !process.send ||
  (configSource !== "current" && configSource !== "historical") ||
  !currentProjectDir ||
  !ruinsDir
) {
  throw new Error("Invalid historical collector worker invocation.");
}

const worktreeConfig = await readConfigAt(process.cwd());
const selectedConfig =
  configSource === "current" ? await readConfigAt(currentProjectDir) : worktreeConfig;
const failures = await runSnapshotCollectors({
  ...selectedConfig,
  _paths: { ...worktreeConfig._paths, ruinsDir },
});
await new Promise<void>((resolvePromise, reject) => {
  process.send!(failures, (error) => (error ? reject(error) : resolvePromise()));
});
process.disconnect?.();
