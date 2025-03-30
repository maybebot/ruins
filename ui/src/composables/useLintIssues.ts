import { ref, onMounted } from "vue";
import { fetchy } from "../fetchy";
import type { FilesRes } from "../../../api/server/api/files";

export function useLintIssues(grouped = false) {
  const data = ref();
  const totals = ref();
  const hasData = ref(true);

  onMounted(async () => {
    const getErrors = () => fetchy<FilesRes>("/files?sortBy=error");
    const getGroupedErrors = () => fetchy<FilesRes>("/files?grouped=1");
    const fetchIssues = grouped ? getGroupedErrors : getErrors;
    const res = await fetchIssues();

    if (!res.data) {
      hasData.value = false;
      return res.data;
    }
    data.value = res?.data;
    totals.value = res?.totals;
  });

  return { data, hasData, totals };
}
