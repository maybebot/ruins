<template>
    <Panel :name="activeTab === 'scope' ? 'Scope' : 'Type'">
        <template #bar>
            <FilterBar :value="filter" @input="setFilter">
                <pyro-tab-group>
                    <pyro-tab @click="activeTab = 'scope'" :selected="activeTab === 'scope'">
                        <StructuredIcon />
                    </pyro-tab>
                    <pyro-tab @click="activeTab = 'type'" :selected="activeTab === 'type'">
                        <ListIcon />
                    </pyro-tab>
                </pyro-tab-group>
            </FilterBar>
        </template>
        <section v-if="activeTab === 'scope'">
            <EmptyState v-if="!hasData" />
            <div style="gap: 0.5em">
                <article v-for="item in filteredScope">
                    <div>{{ item.name }}</div>
                    <div style="flex: 1"></div>
                    <div>{{ item.total }}</div>
                </article>
            </div>
        </section>
        <section v-if="activeTab === 'type'">
            <EmptyState v-if="!hasData" />
            <div v-else style="gap: 0.5em">
                <article v-for="item in filteredType">
                    <div>{{ item.name }}</div>
                    <div style="flex: 1"></div>
                    <div>{{ item.total }}</div>
                </article>
            </div>
        </section>
    </Panel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGitlogs } from '../composables/useGitlogs';
import Panel from './atom/Panel.vue';
import EmptyState from './atom/EmptyState.vue';
import FilterBar from './molecule/FilterBar.vue'
import ListIcon from '@/assets/list.svg';
import StructuredIcon from '@/assets/structured.svg';
import 'pyro/tab-group'
import 'pyro/tab'


const activeTab = ref<'scope' | 'type'>('scope')

const { data, hasData } = useGitlogs();
const filter = ref('');
const setFilter = ({ target }) => { filter.value = target.value }

const filteredScope = computed(() => data.value?.scope?.filter((item) => item.name?.includes(filter.value)));
const filteredType = computed(() => data.value?.type.filter((item) => item.name?.includes(filter.value)));

</script>

<style scoped>
article {
    display: flex;
    border-bottom: 1px solid #e5e7eb44;
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