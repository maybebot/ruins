// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
  {
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  globalIgnores(["**/dist/", "**/api/.output/**/*", "**/api/.nitro/**/*"]),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
  // {
  //   ...tseslint.configs.recommended,
  //   rules: {
  //     "@typescript-eslint/no-explicit-any": "warn",
  //   },
  // }
);
