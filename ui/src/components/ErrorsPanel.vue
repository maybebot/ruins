<template>
    <div class="errors-panel">
        {{ name }}

        <pyro-box>
            <FilterBar @input="setFilter" />
            <pyro-scrollbox style="height: 100%">
                <EmptyState v-if="noData" />
                <div v-else v-for="error in filteredErrors" :key="error.id" class="errors-table">
                    <div>{{ error.name }}</div>
                    <div>{{ error.total }}</div>
                </div>
            </pyro-scrollbox>
        </pyro-box>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import FilterBar from './FilterBar.vue';
import EmptyState from './EmptyState.vue';
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
    return errors.filter((error) => {
        return error.name.includes(filter.value);
    });
});


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
}

pyro-box {
    --pyro-box-border: 1px solid #e5e7eb44;
    flex: 1;
    height: 40vh;
}
</style>