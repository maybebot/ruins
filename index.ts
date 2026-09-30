import type { RuinsConfig } from "@ruins/config";
import { lint } from "@ruins/lint";
import { commits } from "@ruins/commits";
import { todo } from "@ruins/todo";

export const defineConfig = (config: RuinsConfig) => config;

// TODO: change, make clear it's a module
export { lint, commits, todo };
