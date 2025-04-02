<template>
    <section>
        <h2>
            <slot name="title" />
        </h2>
        <slot name="bar"></slot>
        <pyro-box>
            <pyro-scrollbox unstable style="height: 25vh">
                <slot />
            </pyro-scrollbox>
        </pyro-box>
    </section>
</template>

<script setup lang="ts">
import 'pyro/scrollbox';
</script>

<style scoped>
h2 {
    display: flex;
    gap: 0.5em;
}

pyro-box {
    --pyro-box-border: 1px solid var(--pyro-border-color);
    border-top: none;
    background-color: #191919;
}
</style>