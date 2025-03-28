import { ref, onMounted, computed } from "vue";
import { getErrors, getGroupedErrors } from "../api/api";

export function useLintIssues(grouped = false) {
  const data = ref();

  onMounted(async () => {
    const fetchIssues = grouped ? getGroupedErrors : getErrors;
    const res = await fetchIssues();
    data.value = res?.data;
  });

  const hasData = computed(() => {
    return !!data.value;
  });

  return { data, hasData };
}
