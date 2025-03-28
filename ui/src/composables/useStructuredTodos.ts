import { ref, onMounted, computed } from "vue";
import { getTodos, getStructuredTodos } from "../api/api";

export function useStructuredTodos(structured = false) {
  const data = ref();

  onMounted(async () => {
    const fetchTodos = structured ? getStructuredTodos : getTodos;
    const res = await fetchTodos();
    data.value = res?.data;
  });

  const hasData = computed(() => {
    return !!data.value;
  });

  return { data, hasData };
}
