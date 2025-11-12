import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./index.ts", "./cli.ts", "modules/lint/transformers/output.ts"],
  platform: "node",
});
