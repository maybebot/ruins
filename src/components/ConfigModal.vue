<template>
    <pyro-dialog>
        <div slot="action">
            <slot></slot>
        </div>
        <div slot="content">
            <div style="padding: var(--pyro-spacing);">
                Your config:
            </div>
            <pyro-scrollbox>
                <monogon-el lang="json" :content="parsedConfig"></monogon-el>
            </pyro-scrollbox>
        </div>
    </pyro-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import 'pyro/dialog';
import 'pyro/button';
import 'pyro/scrollbox';
import 'monogon';
import { getConfig } from '../api/api';

const config = ref(null);

getConfig().then((data) => {
    config.value = data;
});
const parsedConfig = computed(() => {
    return JSON.stringify(config.value);
});

</script>

<style scoped>
pyro-dialog {
    --pyro-dialog-spacing: 0px;
}

div[slot='content'] {
    display: flex;
    flex-direction: column;
    gap: 1em;
    font-size: 16px;
    padding: 0;
}

pyro-scrollbox {
    max-height: 60vh;
}
</style>