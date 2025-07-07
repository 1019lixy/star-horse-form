<script setup lang="ts">
import { useFlexDesignStore } from '@/store/FlexDesign';
import { piniaInstance } from 'star-horse-lowcode';
import { computed, defineOptions, onMounted } from 'vue';

defineOptions({
    name: "FlexItem"
});
const props = defineProps({
    itemId: { type: String, required: true }
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
    <div :style="itemStyle" @click.stop="selectItem" class="relative min-h-[100px] min-w-[120px] flex flex-col"
        style="border: 1px solid var(--star-horse-style);">
        <div class="absolute top-0 right-0 z-10" @click.stop="deleteItem">
            <star-horse-icon iconClass="delete" :cursor="'pointer'" :color="'var(--star-horse-danger)'" title="删除" />
        </div>
        <div v-if="currentId == itemId" class="absolute top-0 left-0">
            <star-horse-icon iconClass="check" :color="'var(--star-horse-style)'" title="选中" />
        </div>
        <div class="relative flex-1">
            {{ itemStyle }}
        </div>
    </div>
</template>
<style lang="scss" scoped></style>