<template>
    <Panel>
        <template #title>
            <ShieldIcon style="opacity: 0.5" />Lint rules
        </template>
        <template #bar>
            <FilterBar :value="filter" @input="setFilter" @clear="filter = ''" />
        </template>
        <DataSection :hasData="hasData" :data="filteredRules"></DataSection>
    </Panel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRules } from '../composables/useRules';
import Panel from './atom/Panel.vue';
import DataSection from './molecule/DataSection.vue';
import ShieldIcon from '@/assets/shield.svg';
import FilterBar from './molecule/FilterBar.vue'

const { data, hasData } = useRules();
const filter = ref('');
const setFilter = ({ target }) => { filter.value = target.value }

const filteredRules = computed(() => {
    if (!data.value) return [];
    return Object.entries(data.value).map(entry => ({
        name: entry[0],
        total: entry[1].length,
    }));

});
</script>
