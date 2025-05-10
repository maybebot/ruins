import { ref, onMounted } from "vue";
import { fetchy } from "../fetchy";
import type { CommitsRes } from "../../../api/server/api/commits";

export function useCommits() {
  const data = ref<CommitsRes["data"]>();
  const hasData = ref(true);

  onMounted(async () => {
    const res = await fetchy<CommitsRes>("/commits");
    if (!res.data) {
      hasData.value = false;
      return;
    }
    data.value = res.data;
  });

  return { data, hasData };
}
