import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import picomatch from "picomatch";

type Rule = { matches: (path: string) => boolean; owners: string[] };

export const parseCodeowners = (content: string): Rule[] =>
  content.split(/\r?\n/).flatMap((line, index) => {
    const tokens = line.trim().match(/(?:\\.|[^\s])+/g) ?? [];
    const rawPattern = tokens.shift();
    if (!rawPattern || rawPattern.startsWith("#")) return [];
    const comment = tokens.findIndex((token) => token.startsWith("#"));
    if (comment !== -1) tokens.splice(comment);
    const owners = tokens;
    if (
      rawPattern.startsWith("!") ||
      rawPattern.startsWith("\\#") ||
      /(^|[^\\])[[\]]/.test(rawPattern) ||
      owners.some(
        (owner) => !/^@[^/\s]+(?:\/[^/\s]+)?$/.test(owner) && !/^[^@\s]+@[^@\s]+$/.test(owner),
      )
    ) {
      throw new Error(`Invalid CODEOWNERS rule on line ${index + 1}`);
    }

    const rooted = rawPattern.startsWith("/");
    const directory = rawPattern.endsWith("/");
    const pattern = rawPattern.replace(/^\//, "").replace(/\/$/, "");
    if (!pattern) throw new Error(`Invalid CODEOWNERS rule on line ${index + 1}`);
    const base = !rooted && !pattern.includes("/") ? `**/${pattern}` : pattern;
    const options = { dot: true, noext: true, nobrace: true, nonegate: true };
    const match = picomatch(base, options);
    const matchDescendant = directory || !/[*?]/.test(pattern) || pattern.startsWith("**/");
    const descendants = matchDescendant ? picomatch(`${base}/**`, options) : undefined;
    return [{ matches: (path: string) => match(path) || (descendants?.(path) ?? false), owners }];
  });

export const getOwners = (rules: Rule[], path: string): string[] => {
  for (let i = rules.length - 1; i >= 0; i--) {
    if (rules[i].matches(path)) return rules[i].owners;
  }
  return [];
};

const loadFromRoot = async (root: string) => {
  for (const candidate of [".github/CODEOWNERS", "CODEOWNERS", "docs/CODEOWNERS"]) {
    const path = resolve(root, candidate);
    let content: string;
    try {
      content = await readFile(path, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }
    return { root, rules: parseCodeowners(content) };
  }
};

export const loadCodeowners = async (cwd: string) => {
  const localRoot = resolve(cwd);
  const local = await loadFromRoot(localRoot);
  if (local) return local;

  const gitRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
  if (gitRoot !== localRoot) {
    const repository = await loadFromRoot(gitRoot);
    if (repository) return repository;
  }
  throw new Error(`No CODEOWNERS file found in ${localRoot} or ${gitRoot}`);
};

export const toRepositoryPath = (root: string, cwd: string, path: string): string => {
  const absolute = isAbsolute(path) ? path : resolve(cwd, path);
  const result = relative(root, absolute);
  if (!result || result === ".." || result.startsWith(`..${sep}`) || isAbsolute(result)) {
    throw new Error(`File is outside the CODEOWNERS root: ${path}`);
  }
  return result.split(sep).join("/");
};
