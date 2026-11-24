import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "./index.ts",
    cli: "./cli.ts",
    "plugins/structured-todos": "./plugins/structured-todos.ts",
    "snapshot-collector-worker": "./modules/snapshots/worker.ts",
  },
  platform: "node",
});
