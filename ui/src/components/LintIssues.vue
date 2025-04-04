<template>
    <Panel>
        <template #title>
            <SwordsIcon style="opacity: 0.5" /> Lint issues <span style="opacity: 0.5">{{ activeTabText }}</span>
        </template>
        <template #bar>
            <FilterBar :value="filter" @input="onFilter" @clear="filter = ''">
                <pyro-tab-group>
                    <pyro-tab @click="activeTab = 'plain'" :selected="activeTab === 'plain'">
                        <ListIcon />
                    </pyro-tab>
                    <pyro-tab @click="changeTab('grouped')" :selected="activeTab === 'grouped'">
                        <FoldersIcon />
                    </pyro-tab>
                </pyro-tab-group>
            </FilterBar>
        </template>
        <section v-if="activeTab === 'plain'">
            <EmptyState v-if="!hasData" />
            <article v-for="issue in filteredPlain">
                <TheCounter :total="issue?.total" />
                <div v-if="issue?.name">
                    {{ issue.name }}
                </div>
                <div style="flex: 1"></div>
                <div>{{ issue.total }}</div>
            </article>
        </section>
        <section v-if="activeTab === 'grouped'">
            <EmptyState v-if="!hasData" />
            <article v-for="issue in filteredGrouped" @click="setFilter(issue.name)">
                <TheCounter :total="issue?.total" />
                <div v-if="issue?.name">
                    {{ issue.name }}
                </div>
                <div style="flex: 1"></div>
                <div>{{ issue.total }}</div>
            </article>
            <article style="opacity: 0.5;">
                <div>
                    In other places
                </div>
                <div style="flex: 1"></div>
                <div>{{ grouped.totals.value?.total - grouped.totals.value?.grouped }}</div>
            </article>
        </section>
    </Panel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLintIssues } from '../composables/useLintIssues';
import Panel from './atom/Panel.vue';
import EmptyState from './atom/EmptyState.vue';
import TheCounter from './molecule/TheCounter.vue';
import FilterBar from './molecule/FilterBar.vue'
import ListIcon from '@/assets/list.svg';
import SwordsIcon from '@/assets/swords.svg';
import FoldersIcon from '@/assets/folders.svg';

const activeTab = ref<'grouped' | 'plain'>('plain')
const activeTabText = computed(() => activeTab.value === 'grouped' ? '/ Grouped' : '/ List')
const changeTab = (tab: 'grouped' | 'plain') => {
    activeTab.value = tab;
    if (tab === 'grouped') {
        filter.value = ''
    }
}

const { data: plain, hasData } = useLintIssues();
const grouped = useLintIssues(true);

const filter = ref('');
const setFilter = (v) => { filter.value = v; changeTab('plain') }
const onFilter = ({ target }) => { filter.value = target.value }

const filteredPlain = computed(() => plain.value?.filter((error) => error.name?.includes(filter.value)));
const filteredGrouped = computed(() => grouped.data.value?.filter((error) => error.name.includes(filter.value)));
</script>

<style scoped>
article {
    display: flex;
    border-bottom: 1px solid var(--pyro-border-color);
    width: 100%;
    padding: var(--pyro-spacing-s) var(--pyro-spacing);
}

pyro-tab,
pyro-tab-group {
    background-color: var(--pyro-surface-color)
}
</style>