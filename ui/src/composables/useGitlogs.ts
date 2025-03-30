import { ref, onMounted } from "vue";
import { fetchy } from "../fetchy";
import type { GitlogRes } from "../../../api/server/api/gitlog";

export function useGitlogs() {
  const data = ref<GitlogRes["data"]>();
  const hasData = ref(true);

  onMounted(async () => {
    const res = await fetchy<GitlogRes>("/gitlog");
    if (!res.data) {
      hasData.value = false;
      return;
    }
    data.value = res.data;
  });

  return { data, hasData };
}
