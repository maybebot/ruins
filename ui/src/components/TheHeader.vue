<template>
    <header class="header">
        <pyro-box class="flex">
            <GhostIcon />
            <span class="accent">Ruins</span>
            <ASpacer />
            <ConfigModal>
                <ConfigIcon />
            </ConfigModal>
            <a href="https://github.com/maybebot/ruins">
                <GithubIcon />
            </a>

        </pyro-box>
    </header>
</template>

<script setup lang="ts">
import 'pyro/box';
import ConfigModal from './ConfigModal.vue';
import GhostIcon from '@/assets/ghost.svg';
import GithubIcon from '@/assets/github.svg';
import ConfigIcon from '@/assets/config.svg';
import ASpacer from './ASpacer.vue';
</script>

<style scoped>
.header {
    font-size: 24px;
    padding: var(--pyro-spacing) 0;
    gap: var(--pyro-spacing);
}

pyro-box {
    width: 100%;
    gap: var(--pyro-spacing);
}
</style>