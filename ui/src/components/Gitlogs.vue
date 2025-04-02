<template>
    <Panel>
        <template #title>
            <CompassIcon style="opacity: 0.5" /> Commits <span style="opacity: 0.5">{{ activeTabText }}</span>
        </template>
        <template #bar>
            <FilterBar :value="filter" @input="setFilter" @clear="filter = ''">
                <div class="icon" :class="{ selected: isBarchart }">
                    <BarchartIcon @click="isBarchart = !isBarchart" />
                </div>
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
        <section v-if="activeTab === 'scope'">
            <EmptyState v-if="!hasData" />
            <article v-if="isBarchart" class="chart">
                <nev-barchart :data="chartData.data" style="height: 100%; width: auto;"></nev-barchart>
                {{ chartData.legend }}
            </article>
            <article v-else v-for="item in filteredScope">
                <div>{{ item.name }}</div>
                <div style="flex: 1"></div>
                <div>{{ item.total }}</div>
            </article>
        </section>
        <section v-if="activeTab === 'type'">
            <EmptyState v-if="!hasData" />
            <article v-if="isBarchart" class="chart">
                <nev-barchart :data="chartData.data" style="height: 100%; width: auto;"></nev-barchart>
                {{ chartData.legend }}
            </article>
            <article v-else v-for="item in filteredType">
                <div>{{ item.name }}</div>
                <div style="flex: 1"></div>
                <div>{{ item.total }}</div>
            </article>
        </section>
    </Panel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGitlogs } from '../composables/useGitlogs';
import Panel from './atom/Panel.vue';
import EmptyState from './atom/EmptyState.vue';
import FilterBar from './molecule/FilterBar.vue'
import PackageIcon from '@/assets/package.svg';
import CommitIcon from '@/assets/commit.svg';
import CompassIcon from '@/assets/compass.svg';
import BarchartIcon from '@/assets/barchart.svg';
import 'pyro/tab-group'
import 'pyro/tab'
import 'nevera';


const activeTab = ref<'scope' | 'type'>('scope')
const activeTabText = computed(() => activeTab.value === 'scope' ? '/ Scope' : '/ Type')


const isBarchart = ref(false)
const mockData = [
    { key: "A", value: 123 },
    { key: "B", value: 444, fill: 'green' },
    { key: "C", value: 222 },
    { key: "D", value: 333 },
];


const { data, hasData } = useGitlogs();
const filter = ref('');
const setFilter = ({ target }) => { filter.value = target.value }

const filteredScope = computed(() => data.value?.scope?.filter((item) => item.name?.includes(filter.value)));
const filteredType = computed(() => data.value?.type.filter((item) => item.name?.includes(filter.value)));

const toChart = (data) => {
    if (!data || data.value) return []

    return data.map(d => ({
        key: d.name,
        value: d.total,
    }))
}
const chartData = computed(() => {
    const d = activeTab.value === 'scope' ? filteredScope.value : filteredType.value;
    const forChart = toChart(d);
    return {
        data: forChart,
        legend: forChart.map(d => d.key).join(' /')
    }
})
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

.chart {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    --nev-fill: var(--pyro-text-color);
}

.icon {
    width: 24px;
    margin: 0 var(--pyro-spacing-s);
}

.selected {
    color: var(--pyro-accent-color);
}
</style>