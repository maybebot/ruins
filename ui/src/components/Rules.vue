<template>
    <Panel>
        <template #title>
            <ShieldIcon style="opacity: 0.5" />Lint rules
        </template>
        <template #bar>
            <FilterBar :value="filter" @input="setFilter" @clear="filter = ''" />
        </template>
        <section>
            <EmptyState v-if="!hasData" />
            <article v-for="item in filteredRules">
                <div>{{ item.name }}</div>
                <div style="flex: 1"></div>
                <div>{{ item.total }}</div>
            </article>
        </section>
    </Panel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRules } from '../composables/useRules';
import Panel from './atom/Panel.vue';
import ShieldIcon from '@/assets/shield.svg';
import EmptyState from './atom/EmptyState.vue';
import FilterBar from './molecule/FilterBar.vue'

const { data, hasData } = useRules();
const filter = ref('');
const setFilter = ({ target }) => { filter.value = target.value }

const filteredRules = computed(() => {
    if (!data.value) return [];
    return Object.entries(data.value).map(entry => ({
        name: entry[0],
        total: entry[1].length,
    }));

});
</script>

<style scoped>
article {
    display: flex;
    border-bottom: 1px solid var(--pyro-border-color);
    width: 100%;
    padding: var(--pyro-spacing-s) var(--pyro-spacing);
}

.fixed-w {
    width: 4em;
}

pyro-tab,
pyro-tab-group {
    background-color: var(--pyro-surface-color)
}
</style>