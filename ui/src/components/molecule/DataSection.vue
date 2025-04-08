<template>
    <section class="data-section">
        <EmptyState v-if="!hasData" />
        <template v-else>
            <div>
                <article v-for="item in data" :class="{ 'hovered': item.selected }">
                    <div>{{ item.name }}</div>
                    <div style="flex: 1"></div>
                    <div>{{ item.total }}</div>
                </article>
                <slot name="table"></slot>
            </div>
            <slot name="chart" />
        </template>
    </section>
</template>

<script lang="ts" setup>
import EmptyState from '../atom/EmptyState.vue';

type DataList = Array<{
    name: string;
    total: number;
    selected?: boolean;
}>
const props = defineProps<{
    hasData: boolean;
    data: DataList;
}>()
</script>


<style scoped>
.data-section {
    display: flex;
    height: 100%;
}

.data-section>* {
    flex: 1;
}

.hovered {
    background-color: var(--pyro-accent-color);
    color: var(--pyro-background-color);
}

:deep(article) {
    display: flex;
    border-bottom: 1px solid var(--pyro-border-color);
    width: 100%;
    padding: var(--pyro-spacing-s) var(--pyro-spacing);
}
</style>
