<template>
    <Panel :name="grouped ? 'Grouped lint issues' : 'Lint issues'">
        <EmptyState v-if="!hasData" />
        <div v-else style="gap: 0.5em">
            <article v-for="issue in data">
                <TheCounter :total="issue?.total" />
                <div v-if="issue?.name">
                    {{ issue.name }}
                </div>
                <div style="flex: 1"></div>
                <div>{{ issue.total }}</div>
            </article>
        </div>
    </Panel>
</template>

<script setup lang="ts">
import { useLintIssues } from '../composables/useLintIssues';
import Panel from './atom/Panel.vue';
import EmptyState from './atom/EmptyState.vue';
import TheCounter from './molecule/TheCounter.vue';

const props = withDefaults(defineProps<{ grouped?: boolean }>(), {
    grouped: false,
})

const { data, hasData } = useLintIssues(props.grouped);

</script>

<style scoped>
article {
    display: flex;
    border-bottom: 1px solid #e5e7eb44;
    width: 100%;
    padding: 0 var(--pyro-spacing);
}
</style>