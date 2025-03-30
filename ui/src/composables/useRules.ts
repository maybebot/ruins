import { ref, onMounted } from "vue";
import { fetchy } from "../fetchy";
import type { RulesRes } from "../../../api/server/api/eslint/rules";

export function useRules() {
  const data = ref<RulesRes["data"]>();
  const totals = ref();
  const hasData = ref(true);

  onMounted(async () => {
    const res = await fetchy<RulesRes>("/eslint/rules");
    if (!res.data) {
      hasData.value = false;
      return;
    }

    data.value = res?.data;
    totals.value = res?.totals;
  });

  return { data, hasData, totals };
}
