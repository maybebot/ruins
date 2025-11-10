import { RuinsConfig } from "./modules/config/index.js";
import { lint } from "./modules/lint/index.js";

export const defineConfig = (config: RuinsConfig) => config;

// TODO: change, make clear it's a module
export { lint };
