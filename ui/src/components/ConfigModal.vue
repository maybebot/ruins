<template>
    <pyro-dialog>
        <div slot="action">
            <slot></slot>
        </div>
        <div slot="content" style="min-width: 50vw">
            <div style="padding: var(--pyro-spacing);">
                Your config:
            </div>
            <pyro-scrollbox>
                <MonogonCode :content="config" lang="json" @input="handleChange" style="width: 100%" />
            </pyro-scrollbox>
            <pyro-button :disabled="!hasConfigChanged" @click="saveChanges">Save</pyro-button>
        </div>
    </pyro-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import 'pyro/dialog';
import 'pyro/button';
import 'pyro/scrollbox';
import MonogonCode from 'monogon/vue';
import { fetchy } from '../fetchy';

const config = ref('');
const editedConfig = ref('');


fetchy('/config').then((data) => {
    const parsed = JSON.stringify(JSON.parse(JSON.stringify(data)), null, 2);
    config.value = parsed;
    editedConfig.value = parsed;
});

const handleChange = (e) => {
    editedConfig.value = e.target.value;
}

const hasConfigChanged = computed(() => {
    return editedConfig.value !== config.value;
})

const saveChanges = () => {
    console.log(editedConfig.value);
    // TODO
}

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