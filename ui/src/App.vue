<template>
    <TheHeader>
        <ConfigModal>
            <ConfigIcon />
        </ConfigModal>
    </TheHeader>
    <main>
        <LintIssues />
        <Rules />
        <StructuredTodos />
        <Gitlogs />
        <div style="height: 5vh"></div>
    </main>
</template>

<script setup lang="ts">
import ConfigIcon from '@/assets/config.svg';
import TheHeader from './components/molecule/TheHeader.vue'
import LintIssues from './components/LintIssues.vue';
import StructuredTodos from './components/StructuredTodos.vue';
import Rules from './components/Rules.vue';
import ConfigModal from './components/ConfigModal.vue';
import 'pyro/pyro.css';
import 'pyro/skeleton'
import Gitlogs from './components/Gitlogs.vue';
</script>

<style scoped>
main {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--pyro-spacing);
}

main>* {
    min-width: 48%;
    margin-top: 1em;
    flex: 1 0 auto;
}
</style>