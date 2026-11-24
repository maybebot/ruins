import { execFile, fork } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import type { UiTransformContext } from "@ruins/types";
import type {
  RuinsProjectSnapshot,
  RuinsSnapshotHistoryEntry,
  RuinsSnapshotModule,
  SnapshotCollectorFailure,
} from "./types.js";
import { readConfigAt, type RuinsConfigInternal } from "@ruins/config";
import { getModuleViews, readRuinsFile } from "@ruins/views";

const execFileAsync = promisify(execFile);
const snapshotIdPattern = /^(?:\d{8}T\d{9}Z-[0-9a-f]{8}|week-\d{8})$/;
const dayMilliseconds = 24 * 60 * 60 * 1000;

interface CreateSnapshotOptions {
  source?: RuinsProjectSnapshot["source"];
  configSource?: RuinsProjectSnapshot["configSource"];
  asOf?: string;
  period?: RuinsProjectSnapshot["period"];
  commitHash?: string;
  id?: string;
  storageDir?: string;
  collectionErrors?: Map<string, string>;
}

interface HistoricalSnapshotProgress {
  completed: number;
  total: number;
  weekStart: string;
  weekEnd: string;
  commitHash?: string;
  saved: boolean;
  configSource?: RuinsProjectSnapshot["configSource"];
  failures?: SnapshotCollectorFailure[];
}

export const createProjectSnapshot = async (
  config: RuinsConfigInternal,
  options: CreateSnapshotOptions = {},
): Promise<RuinsProjectSnapshot> => {
  const modules = await Promise.all(
    config.modules.map(async (module): Promise<RuinsSnapshotModule | undefined> => {
      const ui = module.ui;
      if (!ui) return undefined;

      const views = await Promise.all(
        getModuleViews(config.modules, module).map(async (view) => {
          const columns = view.columns.map((column) => column.name);
          try {
            const collectionError = options.collectionErrors?.get(module.meta.name);
            if (collectionError) throw new Error(collectionError);
            if (!view.getData && !view.file) {
              throw new Error("No data source is configured.");
            }
            const context: UiTransformContext = {
              config,
              query: options.asOf ? { asOf: options.asOf } : {},
            };
            const data = view.getData
              ? await view.getData(context)
              : await readRuinsFile(config, view.file!, true);
            return {
              name: view.name,
              label: view.label ?? view.name,
              columns,
              rows: view.transformerFn(data, context),
              status: "available" as const,
            };
          } catch (error) {
            return {
              name: view.name,
              label: view.label ?? view.name,
              columns,
              rows: [],
              status: "unavailable" as const,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }),
      );

      return {
        name: module.meta.name,
        label: ui.name,
        views,
      };
    }),
  );
  const enabledModules = modules.filter(
    (module): module is RuinsSnapshotModule => module !== undefined,
  );
  const viewCount = enabledModules.reduce((count, module) => count + module.views.length, 0);
  if (viewCount === 0) {
    throw new Error("No dashboard views are enabled; there is nothing to snapshot.");
  }

  const createdAt = new Date().toISOString();
  const id = options.id ?? `${createdAt.replace(/[-:.]/g, "")}-${randomUUID().slice(0, 8)}`;
  if (!snapshotIdPattern.test(id)) throw new Error("Invalid snapshot ID.");
  const snapshot: RuinsProjectSnapshot = {
    version: 1,
    id,
    createdAt,
    asOf: options.asOf ?? createdAt,
    source: options.source ?? "manual",
    configSource: options.configSource,
    period: options.period,
    commitHash: options.commitHash,
    modules: enabledModules,
  };
  const directory = options.storageDir ?? getSnapshotDirectory(config);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, `${id}.json`), JSON.stringify(snapshot, null, 2));
  return snapshot;
};

export const getProjectSnapshot = async (
  config: RuinsConfigInternal,
  id: string,
): Promise<RuinsProjectSnapshot> => {
  if (!snapshotIdPattern.test(id)) throw new Error("Invalid snapshot ID.");
  const file = resolve(getSnapshotDirectory(config), `${id}.json`);
  const content = await readFile(file, "utf8");
  const snapshot = JSON.parse(content) as RuinsProjectSnapshot;
  if (snapshot.version !== 1 || snapshot.id !== id || !Array.isArray(snapshot.modules)) {
    throw new Error(`Snapshot "${id}" has an invalid format.`);
  }
  return snapshot;
};

export const listSnapshotHistory = async (
  config: RuinsConfigInternal,
  moduleName: string,
): Promise<RuinsSnapshotHistoryEntry[]> =>
  (await readProjectSnapshots(config)).map((snapshot) => ({
    id: snapshot.id,
    asOf: snapshot.asOf,
    source: snapshot.source,
    period: snapshot.period,
    configSource: snapshot.configSource,
    module: snapshot.modules.find((module) => module.name === moduleName),
  }));

const readProjectSnapshots = async (
  config: RuinsConfigInternal,
): Promise<RuinsProjectSnapshot[]> => {
  const directory = getSnapshotDirectory(config);
  let files: string[];
  try {
    files = await readdir(directory);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }

  const snapshots = await Promise.all(
    files
      .filter((file) => file.endsWith(".json") && snapshotIdPattern.test(file.slice(0, -5)))
      .map((file) => getProjectSnapshot(config, file.slice(0, -5))),
  );
  return snapshots.sort((left, right) => right.asOf.localeCompare(left.asOf));
};

export const createGitHistorySnapshots = async (
  config: RuinsConfigInternal,
  onProgress?: (progress: HistoricalSnapshotProgress) => void,
): Promise<number> => {
  let repositoryRoot: string;
  try {
    repositoryRoot = await runGit(["rev-parse", "--show-toplevel"], config._paths.cwd);
  } catch (error) {
    throw new Error("Historical snapshots require a Git repository.", { cause: error });
  }

  const historyWeeks = config.snapshots?.historyWeeks ?? 26;
  if (!Number.isSafeInteger(historyWeeks) || historyWeeks < 1 || historyWeeks > 5200) {
    throw new Error("snapshots.historyWeeks must be an integer between 1 and 5200.");
  }
  const weeks = getCompletedWeeks(historyWeeks);
  const commits = await getWeekEndCommits(repositoryRoot, weeks);
  if (!weeks.some((week) => commits.has(week.end))) {
    throw new Error("No commits were found before the end of the requested history window.");
  }

  const worktreeParent = await mkdtemp(join(tmpdir(), "ruins-history-"));
  const projectPath = relative(repositoryRoot, config._paths.cwd);
  const storageDir = getSnapshotDirectory(config);
  const currentProjectDir = config._paths.cwd;
  const currentRuinsPath = relative(repositoryRoot, config._paths.ruinsDir);
  let snapshotCount = 0;

  try {
    for (let index = 0; index < weeks.length; index += 1) {
      const week = weeks[index];
      const commitHash = commits.get(week.end);
      if (!commitHash) {
        onProgress?.({
          completed: index + 1,
          total: weeks.length,
          weekStart: week.start,
          weekEnd: week.end,
          saved: false,
        });
        continue;
      }
      const worktree = join(worktreeParent, `tree-${index}`);
      let worktreeAdded = false;
      try {
        await runGit(
          ["worktree", "add", "--detach", "--quiet", worktree, commitHash],
          repositoryRoot,
        );
        worktreeAdded = true;
        await linkCurrentDependencies(repositoryRoot, currentProjectDir, worktree, projectPath);

        const historicalProjectDir = resolve(worktree, projectPath);
        let historicalConfig = await readConfigAt(historicalProjectDir);
        let configSource: RuinsProjectSnapshot["configSource"] = "historical";
        if (!hasDashboardViews(historicalConfig)) {
          if (!hasDashboardViews(config)) {
            throw new Error(
              "No dashboard views are enabled in the current or historical configuration.",
            );
          }
          if (
            currentRuinsPath === ".." ||
            currentRuinsPath.startsWith(`..${sep}`) ||
            isAbsolute(currentRuinsPath)
          ) {
            throw new Error(
              "Cannot use the current configuration for history because its data directory is outside the repository.",
            );
          }
          historicalConfig = {
            ...config,
            _paths: {
              ...historicalConfig._paths,
              ruinsDir: resolve(worktree, currentRuinsPath),
            },
          };
          configSource = "current";
        }

        const dataPath = relative(worktree, historicalConfig._paths.ruinsDir);
        if (dataPath === ".." || dataPath.startsWith(`..${sep}`) || isAbsolute(dataPath)) {
          throw new Error("Historical collection data directory must be inside the worktree.");
        }
        await assertNoDirectorySymlinks(worktree, dataPath);

        const failures = await collectInWorktree(
          config,
          historicalConfig,
          configSource,
          currentProjectDir,
        );
        const collectionErrors = new Map<string, string>();
        for (const failure of failures) {
          const module = historicalConfig.modules.find((item) => item.meta.name === failure.module);
          const message = `Collector "${failure.command}" failed: ${failure.error}`;
          collectionErrors.set(failure.module, message);
          if (module?.uiViews) collectionErrors.set(module.uiViews.module, message);
        }
        const asOf = `${week.end}T23:59:59.999Z`;
        await createProjectSnapshot(historicalConfig, {
          source: "git-history",
          configSource,
          asOf,
          period: { start: week.start, end: week.end },
          commitHash,
          id: `week-${week.start.replace(/-/g, "")}`,
          storageDir,
          collectionErrors,
        });
        snapshotCount += 1;
        onProgress?.({
          completed: index + 1,
          total: weeks.length,
          weekStart: week.start,
          weekEnd: week.end,
          commitHash,
          saved: true,
          configSource,
          failures,
        });
      } finally {
        if (worktreeAdded) {
          await runGit(["worktree", "remove", "--force", worktree], repositoryRoot);
        }
      }
    }
  } finally {
    await rm(worktreeParent, { recursive: true, force: true });
  }

  if (snapshotCount === 0) {
    throw new Error("No weekly snapshots could be created from the Git history.");
  }
  return snapshotCount;
};

const isCollectorFailure = (value: unknown): value is SnapshotCollectorFailure =>
  typeof value === "object" &&
  value !== null &&
  "module" in value &&
  typeof value.module === "string" &&
  "command" in value &&
  typeof value.command === "string" &&
  "error" in value &&
  typeof value.error === "string";

const assertNoDirectorySymlinks = async (worktree: string, dataPath: string) => {
  let directory = worktree;
  for (const part of dataPath.split(sep).filter(Boolean)) {
    directory = join(directory, part);
    try {
      if ((await lstat(directory)).isSymbolicLink()) {
        throw new Error(`Historical collection directory contains a symlink: ${directory}`);
      }
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") return;
      throw error;
    }
  }
};

const collectInWorktree = (
  currentConfig: RuinsConfigInternal,
  historicalConfig: RuinsConfigInternal,
  configSource: "current" | "historical",
  currentProjectDir: string,
): Promise<SnapshotCollectorFailure[]> =>
  new Promise((resolvePromise, reject) => {
    const worker = fork(
      resolve(currentConfig._paths.ruins, "dist", "snapshot-collector-worker.mjs"),
      [configSource, currentProjectDir, historicalConfig._paths.ruinsDir],
      { cwd: historicalConfig._paths.cwd, stdio: ["ignore", "ignore", "inherit", "ipc"] },
    );
    let failures: SnapshotCollectorFailure[] | undefined;
    worker.on("message", (message: unknown) => {
      if (Array.isArray(message) && message.every(isCollectorFailure)) failures = message;
    });
    worker.once("error", reject);
    worker.once("exit", (code, signal) => {
      if (code !== 0 || !failures) {
        reject(new Error(`Historical collector worker failed (exit ${code}, signal ${signal}).`));
      } else {
        resolvePromise(failures);
      }
    });
  });

const hasDashboardViews = (config: RuinsConfigInternal) =>
  config.modules.some((module) => module.ui && getModuleViews(config.modules, module).length > 0);

const getSnapshotDirectory = (config: RuinsConfigInternal) => {
  const directory = config.snapshots?.directory ?? "snapshots";
  if (typeof directory !== "string" || !directory.trim()) {
    throw new Error("snapshots.directory must be a non-empty path.");
  }
  return resolve(config._paths.ruinsDir, directory);
};

const getCompletedWeeks = (count: number) => {
  const now = new Date();
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const daysSinceMonday = (monday.getUTCDay() + 6) % 7;
  monday.setUTCDate(monday.getUTCDate() - daysSinceMonday);

  return Array.from({ length: count }, (_, index) => {
    const start = new Date(monday.getTime() - (count - index) * 7 * dayMilliseconds);
    const end = new Date(start.getTime() + 6 * dayMilliseconds);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  });
};

const getWeekEndCommits = async (
  repositoryRoot: string,
  weeks: Array<{ start: string; end: string }>,
) => {
  const firstStart = `${weeks[0].start}T00:00:00.000Z`;
  const lastEnd = `${weeks[weeks.length - 1].end}T23:59:59.999Z`;
  const [baselineOutput, historyOutput] = await Promise.all([
    runGit(["log", "-1", `--before=${firstStart}`, "--format=%H"], repositoryRoot),
    runGit(
      ["log", `--since=${firstStart}`, `--before=${lastEnd}`, "--format=%H%x09%cI"],
      repositoryRoot,
    ),
  ]);
  const commits = historyOutput
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [hash, date] = line.split("\t");
      return { hash, timestamp: new Date(date).getTime() };
    })
    .sort((left, right) => left.timestamp - right.timestamp);
  let cursor = 0;
  let latestCommit = baselineOutput || undefined;
  const weekCommits = new Map<string, string>();

  for (const week of weeks) {
    const end = new Date(`${week.end}T23:59:59.999Z`).getTime();
    while (cursor < commits.length && commits[cursor].timestamp <= end) {
      latestCommit = commits[cursor].hash;
      cursor += 1;
    }
    if (latestCommit) weekCommits.set(week.end, latestCommit);
  }
  return weekCommits;
};

const linkCurrentDependencies = async (
  repositoryRoot: string,
  currentProjectDir: string,
  worktree: string,
  projectPath: string,
) => {
  const linkType = process.platform === "win32" ? "junction" : "dir";
  const dependencySources = new Set([
    resolve(repositoryRoot, "node_modules"),
    resolve(currentProjectDir, "node_modules"),
  ]);
  const buildSources = new Set([
    resolve(repositoryRoot, "dist"),
    resolve(currentProjectDir, "dist"),
  ]);
  for (const source of dependencySources) {
    if (!existsSync(source)) continue;
    const relativeSource = relative(repositoryRoot, source);
    const destination = resolve(worktree, relativeSource);
    if (existsSync(destination)) continue;
    await mkdir(dirname(destination), { recursive: true });
    await symlink(source, destination, linkType);
  }

  for (const source of buildSources) {
    if (!existsSync(source)) continue;
    const relativeSource = relative(repositoryRoot, source);
    const destination = resolve(worktree, relativeSource);
    if (existsSync(destination)) continue;
    await mkdir(destination, { recursive: true });
    const entries = await readdir(source);
    for (const entry of entries) {
      const target = resolve(source, entry);
      const targetType = (await stat(target)).isDirectory() ? linkType : "file";
      await symlink(target, resolve(destination, entry), targetType);
    }
    const currentEntry = resolve(source, "index.mjs");
    const compatibilityEntry = resolve(destination, "index.js");
    if (existsSync(currentEntry) && !existsSync(compatibilityEntry)) {
      await symlink(currentEntry, compatibilityEntry, "file");
    }
  }

  const nestedProject = resolve(worktree, projectPath);
  if (!existsSync(nestedProject)) {
    throw new Error(`Historical project directory does not exist: ${nestedProject}`);
  }
};

const runGit = async (args: string[], cwd: string) => {
  const { stdout } = await execFileAsync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  return stdout.trim();
};
