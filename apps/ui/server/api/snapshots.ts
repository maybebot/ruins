import { defineHandler } from "nitro/h3";
import { readConfig } from "@ruins/config";
import { listSnapshotHistory } from "@ruins/snapshots";

export default defineHandler(async (event) => {
  if (event.req.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET" },
    });
  }

  const requestUrl = new URL(event.req.url, "http://localhost");
  const moduleName = requestUrl.searchParams.get("module");
  if (!moduleName || requestUrl.searchParams.has("id")) {
    return new Response("Specify a module", { status: 400 });
  }
  return listSnapshotHistory(await readConfig(), moduleName);
});
