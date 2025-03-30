import { getTodos } from "../../../config/getTodos";
import type { RuinsTodos } from "../../../types/todos";
import type { RuinsOutput } from "../../../types/ruins";
import consola from "consola";

interface PlainTodo {
  file: string;
  todo: string;
}
interface StructuredTodo {
  todo: string;
  message: string;
  metadata: {
    created: string;
    author: string;
  };
  filename: string;
}

export type TodoRes = RuinsOutput<PlainTodo[] | StructuredTodo[]>;

export default eventHandler(async (event): Promise<TodoRes> => {
  const params = new URLSearchParams(event.path.split("?")[1]);
  const isStructured = Boolean(params.get("structured"));

  const todos = await getTodos();
  if (!todos?.meta) {
    consola.error("[todos] Collection file not found, did you generate it?");
    return;
  }

  if (isStructured) {
    todos.data = getStructured(todos.data);
  }

  return todos;
});

/**
 * Parse structured TODOs to their elements.
 * Example of structured TODO:
 * // TODO(anyKey=anyValye, anyKey= 2025-03-26): some normal todo message
 */
const getStructured = (data: RuinsTodos) => {
  let structuredData = [];
  data.forEach((entry) => {
    structuredData.push({ ...parseTodo(entry.todo), filename: entry.file });
  });
  structuredData.sort((a, b) => {
    const dateA = a.metadata?.created
      ? new Date(a.metadata.created).getTime()
      : Infinity;
    const dateB = b.metadata?.created
      ? new Date(b.metadata.created).getTime()
      : Infinity;

    return dateA - dateB;
  });
  return structuredData;
};

/**
 * Parses a TODO comment into meaningful pieces.
 *
 * @param {string} todo - The TODO comment string.
 * @returns {Record<string, string>} - An object containing the parsed components of the TODO.
 */
function parseTodo(todo: string): Record<string, any> {
  const metadataString = todo.match(/\(([^)]+)\)/);
  const messageString = todo.match(/:\s*(.+)$/);

  const metadata = metadataString
    ? metadataString[1].split(",").reduce((acc, part) => {
        const [key, value] = part.split("=").map((s) => s.trim());
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>)
    : null;

  const message = messageString ? messageString[1] : null;

  return {
    todo,
    message,
    metadata,
  };
}
