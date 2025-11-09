import { RuinsConfig } from "./modules/config/types";
import { lint } from "./modules/lint";

export const defineConfig = (config: RuinsConfig) => config;

// TODO: change, make clear it's a module
export { lint };
