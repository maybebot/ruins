export interface RuinsTodoEntry {
  file: string;
  todo: string;
}

export type RuinsTodoOutput = {
  meta: { timestamp: number };
  data: RuinsTodoEntry[];
};

export interface StructuredTodoRow {
  [key: string]: string | undefined;
  filename: string;
  todo: string;
  message?: string;
  author?: string;
  created?: string;
}
