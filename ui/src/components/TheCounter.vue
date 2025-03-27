<template>

    <component :is="getCountSvg(total)" style="opacity: 0.3" />
</template>

<script lang="ts" setup>
import Count1 from '@/assets/count/1.svg';
import Count2 from '@/assets/count/2.svg';
import Count3 from '@/assets/count/3.svg';
import Count4 from '@/assets/count/4.svg';
import Count5 from '@/assets/count/5.svg';

const props = defineProps<{
    total?: string;
}>()

const countMap = {
    1: Count1,
    2: Count2,
    3: Count3,
    4: Count4,
    5: Count5,
}
const getCountSvg = (count) => {
    switch (count) {
        case 1:
            return Count1;
        case 2:
            return Count2;
        case 3:
            return Count3;
        case 4:
            return Count4;
        default:
            return Count5;

    }
}
</script>