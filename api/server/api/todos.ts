import { getTodos } from "../../../config/getTodos";
import type { RuinsTodos } from "../../../types/todos";
import consola from "consola";

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
  return structuredData;
};

export default eventHandler(async (event) => {
  const params = new URLSearchParams(event.path.split("?")[1]);
  const isStructured = Boolean(params.get("structured"));

  const todos = await getTodos();
  if (!todos?.meta) {
    consola.error("Collection file not found, did you generate it?");
    return;
  }

  if (isStructured) {
    todos.data = getStructured(todos.data);
  }

  return todos;
});

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
