<template>
    <TheHeader />
    <main>
        <Suspense>
            <ErrorsPanel :loader="getErrors" name="Errors by file" />
        </Suspense>
        <Suspense>
            <ErrorsPanel :loader="getGroupedErrors" name="Grouped errors" />
        </Suspense>
        <Suspense>
            <ErrorsPanel :loader="getTodos" name="TODOs" />
        </Suspense>
        <Suspense>
            <ErrorsPanel :loader="getStructuredTodos" name="Structured TODOs" />
        </Suspense>
    </main>
</template>

<script setup lang="ts">
import TheHeader from './components/TheHeader.vue'
import ErrorsPanel from './components/ErrorsPanel.vue';
import { getErrors, getGroupedErrors, getTodos, getStructuredTodos } from './api/api';
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