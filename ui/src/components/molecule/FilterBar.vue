<template>
    <div class="filter-bar">
        <pyro-button size="s" @click="emit('clear')" :disabled="value === ''">
            <FilterIcon />
        </pyro-button>
        <pyro-textfield style="width: 100%" :value="value" placeholder="Filter" clearable></pyro-textfield>
        <slot></slot>
        <div class="spacer" />
    </div>
</template>

<script setup lang="ts">
import 'pyro/textfield';
import 'pyro/button';
import FilterIcon from '@/assets/filter.svg';

withDefaults(defineProps<{ value?: string }>(), {
    value: '',
})

const emit = defineEmits(['change', 'clear']);

</script>

<style scoped>
.filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--pyro-surface-color);

    --pyro-disabled-color: none;
    --pyro-button-border: none;
}

.spacer {
    width: 1em;
}

pyro-textfield:hover {
    --pyro-surface-color: #9991;
}

pyro-textfield {
    --pyro-textfield-border: none;
    margin: 0 1em;
}

pyro-button[disabled] {
    color: var(--pyro-border-color);
}
</style>