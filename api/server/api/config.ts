import { getConfig } from "../utils/getConfig";
import type { RuinsConfig } from "~/types/config";

interface FilesRes {
  data: RuinsConfig;
}

export default eventHandler(async (): Promise<FilesRes> => {
  const config = await getConfig();

  return { data: config };
});
