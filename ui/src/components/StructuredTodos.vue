<template>
    <Panel>
        <template #title>
            <PickaxeIcon style="opacity: 0.5" /> TODOs <span style="opacity: 0.5">{{ activeTabText }}</span>
        </template>
        <template #bar>
            <FilterBar :value="filter" @input="setFilter" @clear="filter = ''">
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
            <EmptyState v-if="!hasData" />
            <div v-else style="gap: 0.5em">
                <article v-for="todo in filteredStructured">
                    <div v-if="todo?.todo">
                        <span style="opacity: 0.25">// </span>
                        {{ todo.message }}
                    </div>
                    <div style="flex: 1"></div>
                    <div v-if="todo.metadata?.author" class="fixed-w">
                        {{ '@' + todo.metadata?.author }}
                    </div>
                    <div v-if="todo.metadata?.created" class="fixed-w">
                        {{ getTimeAgo(todo.metadata?.created) }}
                    </div>
                </article>
            </div>
        </section>
        <section v-if="activeTab === 'plain'">
            <EmptyState v-if="!hasData" />
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
import { useTodos } from '../composables/useTodos';
import Panel from './atom/Panel.vue';
import EmptyState from './atom/EmptyState.vue';
import FilterBar from './molecule/FilterBar.vue'
import ListIcon from '@/assets/list.svg';
import StructuredIcon from '@/assets/structured.svg';
import PickaxeIcon from '@/assets/pickaxe.svg';
import type { StructuredTodo, PlainTodo } from '../../../api/server/api/todos';
import 'pyro/tab-group'
import 'pyro/tab'


const activeTab = ref<'structured' | 'plain'>('structured')
const activeTabText = computed(() => activeTab.value === 'structured' ? '/ Structured' : '/ List')

const { data: plain, hasData } = useTodos();
const { data: structured } = useTodos(true);

const filter = ref('');
const setFilter = ({ target }) => { filter.value = target.value }

const filteredPlain = computed(() => plain.value?.filter((error) => error.todo?.includes(filter.value)) as PlainTodo[]);
const filteredStructured = computed(() => structured.value?.filter((error) => error.todo?.includes(filter.value)) as StructuredTodo[]);

// This in an approximation, and that's ok
const getTimeAgo = (d: string) => {
    if (!d) return;
    const then = new Date(d);
    if (Number.isNaN(then)) return '-'
    const now = new Date();
    const difference = Math.abs(now - then);
    const diffDays = Math.floor(difference / (1000 * 60 * 60 * 24) % 30.4);
    const diffMonths = Math.floor(difference / (1000 * 60 * 60 * 24 * 30.4));
    return `${diffMonths}m ${diffDays}d`
}
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