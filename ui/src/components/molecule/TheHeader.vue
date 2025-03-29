<template>
    <header class="header">
        <pyro-box class="flex">
            <GhostIcon @mouseover="handleOnHover" :class="{ animated: isHovering }" />
            <span class="accent">ruins</span>
            <ASpacer />
            <slot></slot>
            <a href="https://github.com/maybebot/ruins">
                <GithubIcon />
            </a>
        </pyro-box>
    </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import 'pyro/box';
import GhostIcon from '@/assets/ghost.svg';
import GithubIcon from '@/assets/github.svg';
import ASpacer from './../atom/ASpacer.vue';

const isHovering = ref(false)
const handleOnHover = () => {
    isHovering.value = true;
    setTimeout(() => {
        isHovering.value = false;
    }, 10000)
}
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

@keyframes moveUpShakeFade {
    0% {
        transform: translate(0, 0);
        opacity: 1;
    }

    5% {
        transform: translate(-10px, -10px);
    }

    10% {
        transform: translate(10px, -20px);
    }

    15% {
        transform: translate(-10px, -30px);
    }

    20% {
        transform: translate(0, -40px);
        opacity: 0;
    }
}

.animated {
    animation: moveUpShakeFade 10s ease-in-out;
}
</style>