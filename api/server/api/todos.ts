import { getTodos } from "../../../config/getTodos";
import consola from "consola";

export interface DataPoint {
  name: string;
  total: number;
  data?: DataPoint[];
}
interface FilesRes {
  data: DataPoint[] | false;
}

export default eventHandler(async (event): Promise<FilesRes> => {
  const todos = await getTodos();
  if (!todos) {
    consola.error("Collection file not found, did you generate it?");
    return;
  }

  const data = Object.entries(todos).map((entry) => ({
    name: entry[0],
    total: entry[1].length,
  }));
  return { data };
});
