<template>
    <header class="header">
        <pyro-box class="flex">
            <Ghost />
            Ruins
            <ASpacer />
            <a href="https://github.com/maybebot/ruins">
                <Github />
            </a>

        </pyro-box>
    </header>
</template>

<script setup lang="ts">
import 'pyro/box';
import Ghost from '@/assets/ghost.svg';
import Github from '@/assets/github.svg';
import ASpacer from './ASpacer.vue';
</script>

<style scoped>
.header {
    font-size: 24px;
    padding: var(--pyro-spacing);
    gap: var(--pyro-spacing);
}

pyro-box {
    width: 100%;
    gap: var(--pyro-spacing);
}
</style>