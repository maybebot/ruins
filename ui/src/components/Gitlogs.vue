<template>
    <Panel>
        <template #title>
            <CompassIcon style="opacity: 0.5" /> Commits <span style="opacity: 0.5">{{ activeTabText }}</span>
        </template>
        <template #bar>
            <FilterBar :value="filter" @input="setFilter" @clear="filter = ''">
                <div class="icon" :class="{ 'selected-icon': isChartOpen }">
                    <BarchartIcon @click="isChartOpen = !isChartOpen" />
                </div>
                <div style="color: var(--pyro-border-color); margin: var(--pyro-spacing-s)">|</div>
                <pyro-tab-group>
                    <pyro-tab @click="activeTab = 'scope'" :selected="activeTab === 'scope'">
                        <PackageIcon />
                    </pyro-tab>
                    <pyro-tab @click="activeTab = 'type'" :selected="activeTab === 'type'">
                        <CommitIcon />
                    </pyro-tab>
                </pyro-tab-group>
            </FilterBar>
        </template>
        <DataSection v-if="activeTab === 'scope'" :hasData="hasData" :data="filteredScope">
            <template #chart>
                <nev-barchart v-if="isChartOpen" @mouseover="handleMouseover"
                    :data="toChartData(filteredScope, hovered)">
                </nev-barchart>
            </template>
        </DataSection>
        <DataSection v-if="activeTab === 'type'" :hasData="hasData" :data="filteredType">
            <template #chart>
                <nev-piechart v-if="isChartOpen" @mouseover="handleMouseover"
                    :data="toChartData(filteredType, hovered)">
                </nev-piechart>
            </template>
        </DataSection>
    </Panel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGitlogs } from '../composables/useGitlogs';
import Panel from './atom/Panel.vue';
import DataSection from './molecule/DataSection.vue';
import FilterBar from './molecule/FilterBar.vue'
import PackageIcon from '@/assets/package.svg';
import CommitIcon from '@/assets/commit.svg';
import CompassIcon from '@/assets/compass.svg';
import BarchartIcon from '@/assets/barchart.svg';
import { toChartData } from '../utils/chart';
import 'nevera';

const activeTab = ref<'scope' | 'type'>('scope')
const activeTabText = computed(() => activeTab.value === 'scope' ? '/ Scope' : '/ Type')
const isChartOpen = ref(false)

const { data, hasData } = useGitlogs();
const filter = ref('');
const setFilter = ({ target }) => { filter.value = target.value }
const hovered = ref();

const filterData = (data, filter, hovered) => {
    if (!data) return []
    return data.filter((item) => item.name?.includes(filter)).map((item) => {
        return { ...item, selected: item.name === hovered }
    })
}
const filteredScope = computed(() => filterData(data.value?.scope, filter.value, hovered.value));
const filteredType = computed(() => filterData(data.value?.type, filter.value, hovered.value));


const handleMouseover = (e) => {
    hovered.value = e.detail.value;
}
</script>

<style scoped>
pyro-tab,
pyro-tab-group {
    background-color: var(--pyro-surface-color)
}

.icon {
    width: 24px;
    margin: 0 var(--pyro-spacing-s);
}

.selected-icon {
    color: var(--pyro-accent-color);
}

nev-barchart,
nev-piechart {
    margin: 1em;
}
</style>