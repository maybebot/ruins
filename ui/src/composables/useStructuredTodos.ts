import { ref, onMounted } from "vue";
import { fetchy } from "../fetchy";
import type { TodoRes } from "../../../api/server/api/todos";

export function useStructuredTodos(structured = false) {
  const data = ref();
  const hasData = ref(true);

  onMounted(async () => {
    const getTodos = () => fetchy<TodoRes>("/todos");
    const getStructuredTodos = () => fetchy<TodoRes>("/todos?structured=1");
    const fetchTodos = structured ? getStructuredTodos : getTodos;
    const res = await fetchTodos();
    if (!res.data) {
      hasData.value = false;
      return res.data;
    }
    data.value = res?.data;
  });

  return { data, hasData };
}
