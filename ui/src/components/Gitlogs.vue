<template>
    <Panel>
        <template #title>
            <CompassIcon style="opacity: 0.5" /> Commits <span style="opacity: 0.5">{{ activeTabText }}</span>
        </template>
        <template #bar>
            <FilterBar :value="filter" @input="setFilter" @clear="filter = ''">
                <div class="icon" :class="{ 'selected-icon': isBarchart }">
                    <BarchartIcon @click="isBarchart = !isBarchart" />
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
        <section v-if="activeTab === 'scope'" class="with-chart">
            <EmptyState v-if="!hasData" />
            <template v-else>
                <div>
                    <article v-for="item in filteredScope" :class="{ 'hovered-item': item.selected }">
                        <div>{{ item.name }}</div>
                        <div style="flex: 1"></div>
                        <div>{{ item.total }}</div>
                    </article>
                </div>
                <nev-barchart v-if="isBarchart" @mouseover="handleMouseover" :data="chartData"></nev-barchart>
            </template>
        </section>
        <section v-if="activeTab === 'type'" class="with-chart">
            <EmptyState v-if="!hasData" />
            <template v-else>
                <div>
                    <article v-for="item in filteredType" :class="{ 'hovered-item': item.selected }">
                        <div>{{ item.name }}</div>
                        <div style="flex: 1"></div>
                        <div>{{ item.total }}</div>
                    </article>
                </div>
                <nev-piechart v-if="isBarchart" @mouseover="handleMouseover" :data="chartData"></nev-piechart>
            </template>
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
import { toChartData } from '../utils/chart';
import 'pyro/tab-group'
import 'pyro/tab'
import 'nevera';

// TODO: solve this mess, to much repetition and looping on the same thing, consider abstracting

const activeTab = ref<'scope' | 'type'>('scope')
const activeTabText = computed(() => activeTab.value === 'scope' ? '/ Scope' : '/ Type')
const isBarchart = ref(true)

const { data, hasData } = useGitlogs();
const filter = ref('');
const setFilter = ({ target }) => { filter.value = target.value }

const hovered = ref();

const filteredScope = computed(() => {
    if (!data.value?.scope) return []
    const filtered = data.value?.scope.filter((item) => item.name?.includes(filter.value))
    return filtered.map((item) => {
        return { ...item, selected: item.name === hovered.value }
    })
});
const filteredType = computed(() => {
    if (!data.value?.type) return []
    const filtered = data.value?.type.filter((item) => item.name?.includes(filter.value))
    return filtered.map((item) => {
        return { ...item, selected: item.name === hovered.value }
    })
});

const chartData = computed(() =>
    toChartData(activeTab.value === 'scope' ? filteredScope.value : filteredType.value, hovered.value)
)
const handleMouseover = (e) => {
    hovered.value = e.detail.value;
}
</script>

<style scoped>
section.with-chart {
    display: flex;
    height: 100%;
}

section.with-chart>* {
    flex: 1;
}

nev-barchart,
nev-piechart {
    margin: 1em;
}

.hovered-item {
    background-color: var(--pyro-accent-color);
    color: var(--pyro-background-color);
}

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

.icon {
    width: 24px;
    margin: 0 var(--pyro-spacing-s);
}

.selected-icon {
    color: var(--pyro-accent-color);
}
</style>