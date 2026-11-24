import { log } from "@clack/prompts";
import type { RuinsConfigInternal } from "@ruins/config";
import type { RuinsModule } from "@ruins/types";
import { createGitHistorySnapshots, createProjectSnapshot } from "./index.js";

export const snapshotCommands = [
  {
    flag: "snapshot",
    label: "Save Project Snapshot",
    value: "snapshot",
    hint: "Capture all enabled dashboard views for later comparison",
    runnable: true,
    getAction: (config: RuinsConfigInternal) => async () => {
      const snapshot = await createProjectSnapshot(config);
      log.success(`Saved project snapshot ${snapshot.id}`);
      log.info(
        `Captured ${snapshot.modules.length} modules in ${snapshot.modules.reduce(
          (count, module) => count + module.views.length,
          0,
        )} views.`,
      );
    },
  },
  {
    flag: "snapshot-history",
    label: "Generate Weekly History",
    value: "snapshot-history",
    hint: "Build weekly snapshots from Git history",
    runnable: true,
    getAction: (config: RuinsConfigInternal) => async () => {
      let failedCollectors = 0;
      const snapshotCount = await createGitHistorySnapshots(config, (progress) => {
        const state = progress.saved
          ? `saved${progress.configSource === "current" ? " (using current configuration)" : ""}`
          : "skipped (no commit by week end)";
        log.info(
          `${progress.completed}/${progress.total}: ${progress.weekStart} to ${progress.weekEnd} ${state}`,
        );
        for (const failure of progress.failures ?? []) {
          failedCollectors += 1;
          log.warn(`${failure.module} / ${failure.command}: ${failure.error}`);
        }
      });
      if (failedCollectors > 0) {
        log.warn(
          `Generated ${snapshotCount} weekly snapshots with ${failedCollectors} collector failures; affected views are unavailable.`,
        );
        process.exitCode = 1;
      } else {
        log.success(`Generated ${snapshotCount} weekly project snapshots.`);
      }
    },
  },
] satisfies NonNullable<RuinsModule["cli"]>["commands"];
