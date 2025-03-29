<template>
    <TheHeader>
        <ConfigModal>
            <ConfigIcon />
        </ConfigModal>
    </TheHeader>
    <main>
        <LintIssues />
        <StructuredTodos />
    </main>
</template>

<script setup lang="ts">
import ConfigIcon from '@/assets/config.svg';
import TheHeader from './components/molecule/TheHeader.vue'
import LintIssues from './components/LintIssues.vue';
import StructuredTodos from './components/StructuredTodos.vue';
import ConfigModal from './components/ConfigModal.vue';
import 'pyro/pyro.css';
import 'pyro/skeleton'
</script>

<style scoped>
main {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--pyro-spacing);
}
</style>