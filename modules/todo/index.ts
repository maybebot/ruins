import type { RuinsModule } from "@ruins/types";
import type { RuinsConfigInternal } from "@ruins/config";
import { collectTodos } from "./cmd/collect-todos.js";
import { getPlainRows, getStructuredRows } from "./transformers/parse.js";

export const todo = (): RuinsModule => {
  return {
    meta: {
      name: "todo",
      description: "Collects TODO comments found in the codebase",
    },
    cli: {
      commands: [
        {
          value: "collect-todos",
          label: "Collect TODOs",
          hint: "Collect all TODOs found in the project on a file per file basis.",
          getAction: (config: RuinsConfigInternal) => () => collectTodos(config),
          runnable: true,
        },
      ],
    },
    ui: {
      name: "Todo",
      icon: "pickaxe",
      views: [
        {
          name: "default",
          label: "List",
          file: "todos.json",
          columns: [{ name: "file" }, { name: "todo" }],
          transformerFn: getPlainRows,
        },
        {
          name: "structured",
          label: "Structured",
          file: "todos.json",
          columns: [
            { name: "filename" },
            { name: "message" },
            { name: "author" },
            { name: "created" },
          ],
          transformerFn: getStructuredRows,
        },
      ],
    },
  };
};
