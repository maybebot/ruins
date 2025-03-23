import { getConfig, type RuinsConfig } from "../../../config/getConfig";

export default eventHandler(async (): Promise<{ data: RuinsConfig }> => {
  const config = await getConfig();

  return { data: config };
});
