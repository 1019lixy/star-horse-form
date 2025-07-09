<script setup lang="ts">
import { useFlexDesignStore } from '@/store/FlexDesign';
import { piniaInstance } from 'star-horse-lowcode';
import { computed, defineOptions, onMounted } from 'vue';

defineOptions({
    name: "FlexItem"
});
const props = defineProps({
    itemId: { type: String, required: true },
    type: { type: String, default: "flex" }
});
const emit = defineEmits(["selectItem"]);
const flexDesign = useFlexDesignStore(piniaInstance);
const itemStyle = computed(() => flexDesign.getItem(props.itemId));
const currentId = computed(() => flexDesign.getCurrentItem());
const selectItem = () => {
    flexDesign.setCurrentItem(props.itemId);
    emit("selectItem", props.itemId);
}
const deleteItem = () => {
    flexDesign.delItem(props.itemId);
}
const init = () => {

}
onMounted(() => {
    init();
})
</script>
<template>
    <div :style="itemStyle" @click.stop="selectItem" class="item-info" :class="{ 'w-full': type == 'grid' }">
        <div class="absolute top-0 right-0 z-10" @click.stop="deleteItem">
            <star-horse-icon iconClass="delete" :cursor="'pointer'" :color="'var(--star-horse-danger)'" title="删除" />
        </div>
        <div v-if="currentId == itemId" class="absolute top-0 left-0">
            <star-horse-icon iconClass="check" :color="'var(--star-horse-style)'" title="选中" />
        </div>
        <div class="relative">
            {{ itemStyle }}
        </div>
    </div>
</template>
<style lang="scss" scoped>
.item-info {
    border-radius: 3px;
    padding: 1rem 1.5rem;
    cursor: pointer;
    opacity: 1;
    transform: none;
    min-width: 7rem;
    min-height: 5.5rem;
    background: #fefefe;
    margin: 10px auto;
    border: 3px solid var(--star-horse-style);
    box-shadow: 3px 3px 0 0 var(--star-horse-style);
    position: relative;
    transition: background .3s ease, box-shadow .3s ease;
}
</style>