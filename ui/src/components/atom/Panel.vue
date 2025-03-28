<template>
    <section>
        <h2>{{ name }}</h2>
        <pyro-box>
            <pyro-scrollbox style="height: 100%; max-height: 25vh">
                <div class="errors-table">
                    <slot />
                </div>
            </pyro-scrollbox>
        </pyro-box>
    </section>
</template>

<script setup lang="ts">
import 'pyro/scrollbox';

defineProps<{ name?: string; }>()

</script>

<style scoped>
pyro-box {
    --pyro-box-border: 1px solid #e5e7eb44;
}
</style>