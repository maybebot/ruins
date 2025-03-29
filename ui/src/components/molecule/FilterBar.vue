<template>
    <div class="filter-bar">
        <pyro-textfield style="width: 100%" value="" placeholder="Search" clearable></pyro-textfield>
        <slot></slot>
        <pyro-button size="s">Filter</pyro-button>
    </div>
</template>

<script setup lang="ts">
import 'pyro/textfield';
import 'pyro/button';

const emits = defineEmits(['change']);

</script>

<style scoped>
.filter-bar {
    display: flex;
    justify-content: space-between;
}
</style>