<template>
    <div class="errors-panel">
        {{ name }}

        <pyro-box>
            <FilterBar @input="setFilter" />
            <pyro-scrollbox style="height: 100%; max-height: 25vh">
                <EmptyState v-if="noData" />
                <div v-else v-for="error in filteredErrors" :key="error.id" class="errors-table">
                    <div style="display: flex; gap: 0.5em">
                        <component :is="getCountSvg(error.total)" style="opacity: 0.3" />
                        <div v-if="error.name">
                            {{ error.name }}
                        </div>
                        <div v-else>
                            <!-- TODO: this is horrible -->
                            <span>{{ error.message }} <br> {{ error.filename }} <br>
                                <code>{{ error.metadata }}</code></span>
                        </div>
                    </div>
                    <div>{{ error.total }}</div>
                </div>
            </pyro-scrollbox>
        </pyro-box>
    </div>
</template>

<script setup lang="ts">
// TODO(created=2025-03-26, author=ian): all of this is horribly written and unmaintanable
import { computed, ref } from 'vue';
import FilterBar from './FilterBar.vue';
import EmptyState from './EmptyState.vue';
import Count1 from '@/assets/count/1.svg';
import Count2 from '@/assets/count/2.svg';
import Count3 from '@/assets/count/3.svg';
import Count4 from '@/assets/count/4.svg';
import Count5 from '@/assets/count/5.svg';
import 'pyro/scrollbox';

const props = defineProps<{
    loader: () => Promise<{ data: any }>;
    name?: string;
}>()

const { data: errors } = await props.loader();
const noData = computed(() => {
    return errors === false;
})

const filter = ref('');
const setFilter = (e) => {
    filter.value = e.target.value;
}

const filteredErrors = computed(() => {
    try {

        return errors.filter((error) => {
            return error.name.includes(filter.value);
        });
    }
    catch {
        return errors;
    }
});

const countMap = {
    1: Count1,
    2: Count2,
    3: Count3,
    4: Count4,
    5: Count5,
}
const getCountSvg = (count) => {
    switch (count) {
        case 1:
            return Count1;
        case 2:
            return Count2;
        case 3:
            return Count3;
        case 4:
            return Count4;
        default:
            return Count5;

    }
}

</script>

<style scoped>
.errors-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.errors-table {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e5e7eb44;
    padding: 0 var(--pyro-spacing);
}

pyro-box {
    --pyro-box-border: 1px solid #e5e7eb44;
    flex: 1;
    height: 40vh;
}
</style>