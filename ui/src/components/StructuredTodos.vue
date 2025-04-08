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
        <DataSection v-if="activeTab === 'structured'" :hasData="hasData" :data="[]">
            <template #table>
                <article v-for="todo in filteredStructured">
                    <div v-if="todo?.todo">
                        <span style="opacity: 0.25">// </span>
                        {{ todo.message }}
                    </div>
                    <div style="flex: 1"></div>
                    <div v-if="todo.metadata?.author" class="field">
                        {{ '@' + todo.metadata?.author }}
                    </div>
                    <div v-if="todo.metadata?.created" class="field">
                        {{ getTimeAgo(todo.metadata?.created) }}
                    </div>
                </article>
            </template>
        </DataSection>
        <DataSection v-if="activeTab === 'plain'" :hasData="hasData" :data="[]">
            <template #table>
                <article v-for="issue in filteredPlain">
                    {{ issue.todo }}
                </article>
            </template>
        </DataSection>
    </Panel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTodos } from '../composables/useTodos';
import Panel from './atom/Panel.vue';
import FilterBar from './molecule/FilterBar.vue'
import DataSection from './molecule/DataSection.vue';
import ListIcon from '@/assets/list.svg';
import StructuredIcon from '@/assets/structured.svg';
import PickaxeIcon from '@/assets/pickaxe.svg';
import type { StructuredTodo, PlainTodo } from '../../../api/server/api/todos';

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
