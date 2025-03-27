<template>
    <Panel name="Lint issues">
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
import Panel from './Panel.vue';
import TheCounter from './TheCounter.vue';
import EmptyState from './EmptyState.vue';

const { data, hasData } = useLintIssues();

</script>

<style scoped>
article {
    display: flex;
    border-bottom: 1px solid #e5e7eb44;
    width: 100%;
    padding: 0 var(--pyro-spacing);
}
</style>