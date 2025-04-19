<template>
    <TheHeader>
        <ConfigModal>
            <ConfigIcon />
        </ConfigModal>
    </TheHeader>
    <main>
        <LintIssues v-if="config?.eslint?.enabled" />
        <Rules v-if="config?.eslint?.enabled" />
        <StructuredTodos v-if="config?.todos?.enabled" />
        <Gitlogs v-if="config?.gitlog?.enabled" />
        <div style="height: 5vh"></div>
    </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ConfigIcon from '@/assets/config.svg';
import TheHeader from './components/molecule/TheHeader.vue'
import LintIssues from './components/LintIssues.vue';
import StructuredTodos from './components/StructuredTodos.vue';
import Rules from './components/Rules.vue';
import ConfigModal from './components/ConfigModal.vue';
import 'pyro/pyro.css';
import 'pyro/tab-group'
import 'pyro/tab'
import 'pyro/skeleton'
import Gitlogs from './components/Gitlogs.vue';
import { fetchy } from './fetchy';

const config = ref();
fetchy('/config').then(({ data }) => {
    config.value = data;
    console.log(data)
    const parsed = JSON.stringify(JSON.parse(JSON.stringify(data)), null, 2);
    // config.value = parsed;
});
</script>

<style scoped>
main {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1em;
}

main>* {
    min-width: calc(50% - 1em);
    margin-top: 1em;
    flex: 1 0 auto;
}
</style>