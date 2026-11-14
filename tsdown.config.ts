import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./index.ts", "./cli.ts", "./plugins/structured-todos.ts"],
  platform: "node",
});
