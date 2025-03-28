<template>
    <Panel :name="structured ? 'Structured TODOs' : 'TODOs'">
        <EmptyState v-if="!hasData" />
        <div v-else style="gap: 0.5em">
            <FilterBar @input="setFilter" />
            <article v-for="issue in filtered">
                <TheCounter :total="issue?.total" />
                <div v-if="issue?.todo">
                    {{ issue.todo }}
                </div>
                <div style="flex: 1"></div>
                <div>{{ issue.total }}</div>
            </article>
        </div>
    </Panel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStructuredTodos } from '../composables/useStructuredTodos';
import Panel from './atom/Panel.vue';
import EmptyState from './atom/EmptyState.vue';
import TheCounter from './molecule/TheCounter.vue';
import FilterBar from './molecule/FilterBar.vue'
const props = withDefaults(defineProps<{ structured?: boolean }>(), {
    structured: false,
})

const { data, hasData } = useStructuredTodos(props.structured);

const filter = ref('');
const setFilter = ({ target }) => { filter.value = target.value }
const filtered = computed(() => data.value.filter((error) => error.todo?.includes(filter.value)));
</script>

<style scoped>
article {
    display: flex;
    border-bottom: 1px solid #e5e7eb44;
    width: 100%;
    padding: 0 var(--pyro-spacing);
}
</style>