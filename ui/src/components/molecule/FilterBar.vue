<template>
    <div class="filter-bar">
        <pyro-textfield style="width: 100%" :value="value" placeholder="Filter" clearable></pyro-textfield>
        <slot></slot>
        <div class="spacer" />
    </div>
</template>

<script setup lang="ts">
import 'pyro/textfield';
import 'pyro/button';

withDefaults(defineProps<{ value?: string }>(), {
    value: '',
})

const emits = defineEmits(['change']);

</script>

<style scoped>
.filter-bar {
    display: flex;
    justify-content: space-between;
}

.spacer {
    width: 1em;
    background-color: var(--pyro-surface-color);
}
</style>