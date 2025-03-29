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
        <section v-if="activeTab === 'structured'" class="structured">
            <EmptyState v-if="!plain.hasData" />
            <div v-else style="gap: 0.5em">
                <article v-for="issue in filteredStructured">
                    <div v-if="issue?.todo" class="todo">
                        {{ issue.todo }}
                    </div>
                    <div style="background-color: var(--pyro-surface-color);">{{ issue }}</div>
                </article>
            </div>
        </section>
        <section v-if="activeTab === 'plain'">
            <EmptyState v-if="!structured.hasData" />
            <div v-else style="gap: 0.5em">
                <article v-for="issue in filteredPlain">
                    <TheCounter :total="issue?.total" />
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
import TheCounter from './molecule/TheCounter.vue';
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
</script>

<style scoped>
article {
    display: flex;
    border-bottom: 1px solid #e5e7eb44;
    width: 100%;
    padding: 0 var(--pyro-spacing);
}

.structured article {
    flex-direction: column;
}

.structured article .todo {
    display: flex;
}

pyro-tab,
pyro-tab-group {
    background-color: var(--pyro-surface-color)
}
</style>