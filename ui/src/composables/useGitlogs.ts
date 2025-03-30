import { ref, onMounted } from "vue";
import { fetchy } from "../fetchy";
import type { GitlogRes, GitlogEntry } from "../../../api/server/api/gitlog";

export function useGitlogs() {
  const scope = ref<GitlogEntry>();
  const type = ref<GitlogEntry>();
  const hasData = ref(true);

  onMounted(async () => {
    const res = await fetchy<GitlogRes>("/gitlog");
    if (!res.data) return res.data;
    if (!res.data) hasData.value = false;
    scope.value = res?.data.scope;
    type.value = res?.data.type;
  });

  return { scope, type, hasData };
}
