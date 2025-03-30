import { ref, onMounted, computed } from "vue";
import { fetchy } from "../fetchy";

type GitlogInfo = { name: string; total: number }[];
interface GitlogRes {
  scope: GitlogInfo;
  type: GitlogInfo;
}

export function useGitlogs() {
  const scope = ref<GitlogInfo>();
  const type = ref<GitlogInfo>();
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
