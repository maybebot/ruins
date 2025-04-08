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
        <DataSection v-if="activeTab === 'plain'" :hasData="hasData" :data="filteredPlain" />
        <DataSection v-if="activeTab === 'grouped'" :hasData="hasData" :data="[]">
            <template #table>
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
                    <div>{{ groupedTotals.total - groupedTotals.grouped }}</div>
                </article>
            </template>
        </DataSection>
    </Panel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLintIssues } from '../composables/useLintIssues';
import Panel from './atom/Panel.vue';
import TheCounter from './molecule/TheCounter.vue';
import FilterBar from './molecule/FilterBar.vue'
import DataSection from './molecule/DataSection.vue';
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

const { data: plainData, hasData } = useLintIssues();
const { data: groupedData, totals: groupedTotals } = useLintIssues(true);

const filter = ref('');
const setFilter = (v) => { filter.value = v; changeTab('plain') }
const onFilter = ({ target }) => { filter.value = target.value }
const hovered = ref();

const filterData = (data, filter, hovered) => {
    if (!data) return []
    return data.filter((item) => item.name?.includes(filter)).map((item) => {
        return { ...item, selected: item.name === hovered }
    })
}

const filteredPlain = computed(() => filterData(plainData.value, filter.value, hovered.value));
const filteredGrouped = computed(() => filterData(groupedData.value, filter.value, hovered.value));
</script>

<style scoped>
pyro-tab,
pyro-tab-group {
    background-color: var(--pyro-surface-color)
}
</style>