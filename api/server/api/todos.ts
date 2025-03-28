import { getTodos } from "../../../config/getTodos";
import type { RuinsTodos } from "../../../types/todos";
import consola from "consola";

export interface DataPoint {
  todo: string;
  total: number;
  data?: DataPoint[];
}
interface FilesRes {
  data: DataPoint[] | false;
}

/**
 * Parse structured TODOs to their elements.
 * Example of structured TODO:
 * // TODO(anyKey=anyValye, anyKey= 2025-03-26): some normal todo message
 */
const getStructured = (data: RuinsTodos) => {
  let potatos = [];
  Object.entries(data).forEach((entry) => {
    entry[1].forEach((comment) => {
      potatos.push({ ...parseTodo(comment), filename: entry[0] });
    });
  });
  return { data: potatos };
};

export default eventHandler(async (event): Promise<FilesRes> => {
  const params = new URLSearchParams(event.path.split("?")[1]);
  const isStructured = Boolean(params.get("structured"));

  const todos = await getTodos();
  if (!todos) {
    consola.error("Collection file not found, did you generate it?");
    return;
  }

  if (isStructured) {
    return getStructured(todos);
  }

  const data = Object.entries(todos).map((entry) => ({
    todo: entry[0],
    total: entry[1].length,
  }));
  return { data };
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
