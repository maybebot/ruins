import type { RuinsTodoEntry, RuinsTodoOutput, StructuredTodoRow } from "./types.js";

export const getPlainRows = (data: RuinsTodoOutput) => {
  return (data?.data ?? []).map((entry) => ({ file: entry.file, todo: entry.todo }));
};

export const getStructuredRows = (data: RuinsTodoOutput): StructuredTodoRow[] => {
  const rows = (data?.data ?? []).map(parseTodo);
  return rows.sort((left, right) => {
    const leftDate = left.created ? new Date(left.created).getTime() : Infinity;
    const rightDate = right.created ? new Date(right.created).getTime() : Infinity;
    return leftDate - rightDate;
  });
};

/**
 * Parses a TODO comment into meaningful pieces.
 * Example of structured TODO: `// TODO(created=2025-03-26, author=ian): some message`
 */
const parseTodo = (entry: RuinsTodoEntry): StructuredTodoRow => {
  const metadataMatch = entry.todo.match(/\(([^)]+)\)/);
  const messageMatch = entry.todo.match(/:\s*(.+)$/);

  const metadata = metadataMatch
    ? metadataMatch[1].split(",").reduce<Record<string, string>>((acc, part) => {
        const [key, value] = part.split("=").map((piece) => piece.trim());
        if (key) acc[key] = value ?? "";
        return acc;
      }, {})
    : {};

  return {
    filename: entry.file,
    todo: entry.todo,
    message: messageMatch?.[1],
    author: metadata.author,
    created: metadata.created,
  };
};
