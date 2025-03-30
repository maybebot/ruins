<template>
    <section>
        <h2>{{ name }}</h2>
        <slot name="bar"></slot>
        <pyro-box>
            <pyro-scrollbox unstable style="height: 25vh">
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
    --pyro-box-border: 1px solid var(--pyro-border-color);
    border-top: none;
    background-color: #292a2d11;

}
</style>