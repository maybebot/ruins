<template>
    <Panel :name="structured ? 'Structured TODOs' : 'TODOs'">
        <template #bar>
            <FilterBar @input="setFilter">
                <pyro-tab-group>
                    <pyro-tab @click="activeTab = 'structured'" :selected="activeTab === 'structured'">
                        <StructuredIcon />
                    </pyro-tab>
                    <pyro-tab @click="activeTab = 'plain'" :selected="activeTab === 'plain'">
                        <ListIcon />
                    </pyro-tab>
                </pyro-tab-group>
            </FilterBar>
        </template>
        <section v-if="activeTab === 'structured'">
            <EmptyState v-if="!plain.hasData" />
            <div v-else style="gap: 0.5em">
                <article v-for="issue in filteredStructured">
                    <div v-if="issue?.todo">
                        <span style="opacity: 0.25">// </span>
                        {{ issue.message }}
                    </div>
                    <div style="flex: 1"></div>
                    <div v-if="issue.metadata?.author" class="fixed-w">
                        {{ '@' + issue.metadata?.author }}
                    </div>
                    <div v-if="issue.metadata?.created" class="fixed-w">
                        {{ getTimeAgo(issue.metadata?.created) }}
                    </div>
                </article>
            </div>
        </section>
        <section v-if="activeTab === 'plain'">
            <EmptyState v-if="!structured.hasData" />
            <div v-else style="gap: 0.5em">
                <article v-for="issue in filteredPlain">
                    <div v-if="issue?.todo">
                        {{ issue.todo }}
                    </div>
                </article>
            </div>
        </section>
    </Panel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStructuredTodos } from '../composables/useStructuredTodos';
import Panel from './atom/Panel.vue';
import EmptyState from './atom/EmptyState.vue';
import FilterBar from './molecule/FilterBar.vue'
import ListIcon from '@/assets/list.svg';
import StructuredIcon from '@/assets/structured.svg';
import 'pyro/tab-group'
import 'pyro/tab'


const activeTab = ref<'structured' | 'plain'>('structured')

const plain = useStructuredTodos();
const structured = useStructuredTodos(true);

const filter = ref('');
const setFilter = ({ target }) => { filter.value = target.value }

const filteredStructured = computed(() => structured.data.value?.filter((error) => error.todo?.includes(filter.value)));
const filteredPlain = computed(() => plain.data.value?.filter((error) => error.todo?.includes(filter.value)));

// This in an approximation, and that's ok
const getTimeAgo = (d: string) => {
    if (!d) return;
    const then = new Date(d);
    if (Number.isNaN(then)) return '-'
    const now = new Date();
    console.log(then)
    const difference = Math.abs(now - then);
    const diffDays = Math.floor(difference / (1000 * 60 * 60 * 24) % 30.4);
    const diffMonths = Math.floor(difference / (1000 * 60 * 60 * 24 * 30.4));
    return `${diffMonths}m ${diffDays}d`
}
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