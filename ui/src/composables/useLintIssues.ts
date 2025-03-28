import { ref, onMounted, computed } from "vue";
import { getErrors } from "../api/api";

export function useLintIssues() {
  const data = ref();

  onMounted(async () => {
    const res = await getErrors();
    data.value = res?.data;
  });

  const hasData = computed(() => {
    return !!data.value;
  });

  return { data, hasData };
}
