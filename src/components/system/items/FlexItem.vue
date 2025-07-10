<script setup lang="ts">
import { useFlexDesignStore } from '@/store/FlexDesign';
import { piniaInstance, uuid } from 'star-horse-lowcode';
import { computed, defineOptions, onBeforeUnmount, onMounted, ref } from 'vue';

defineOptions({
    name: "FlexItem"
});
const props = defineProps({
    itemId: { type: String, required: true },
    type: { type: String, default: "flex" },
    direction: { type: String, default: "row" }
});
const emit = defineEmits(["selectItem"]);
const flexDesign = useFlexDesignStore(piniaInstance);
const itemStyle = computed(() => flexDesign.getItem(props.itemId));
const compList = computed(() => flexDesign.getComp(props.itemId));
const currentId = computed(() => flexDesign.getCurrentItem());
const containerDirection = computed(() => flexDesign.getContainerDirection());
const selectItem = () => {
    flexDesign.setCurrentItem(props.itemId);
    emit("selectItem", props.itemId);
}
const deleteItem = () => {
    flexDesign.delItem(props.itemId);
}
const onDragAdd = (evt: Event, list: any[]) => {
    console.log(evt, list);
}
const resizeContainer = ref<HTMLElement>();
let startX = 0;
let startY = 0;
let startWidth = 0;
let startHeight = 0;
let resizeDirection = '';

const startResize = (dir: string, e: MouseEvent) => {
    resizeDirection = dir;
    startX = e.clientX;
    startY = e.clientY;
    if (resizeContainer.value) {
        startWidth = resizeContainer.value.offsetWidth;
        startHeight = resizeContainer.value.offsetHeight;
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
    }
};

const handleResize = (e: MouseEvent) => {
    if (!resizeContainer.value) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    if (resizeDirection === 'right') {
        resizeContainer.value.style.width = `${startWidth + deltaX}px`;
    }
    else if (resizeDirection === 'bottom') {
        resizeContainer.value.style.height = `${startHeight + deltaY}px`;
    }
};

const stopResize = () => {
    removeListener();
    if (!resizeContainer.value) return;
    // 这里可以添加尺寸变化后的回调逻辑
    itemStyle.value.width = resizeContainer.value?.style?.width;
    itemStyle.value.height = resizeContainer.value?.style?.height;
};
const removeListener = () => {
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
}
onBeforeUnmount(() => {
    removeListener();
});
const init = () => {

}
onMounted(() => {
    init();
})
</script>
<template>
    <div :style="itemStyle" @click.stop="selectItem" class="item-info" ref="resizeContainer"
        :class="{ 'w-full': type == 'grid', 'item-width': containerDirection.includes('column') }">
        <div class="absolute top-0 right-0 z-10" @click.stop="deleteItem">
            <star-horse-icon iconClass="delete" :cursor="'pointer'" :color="'var(--star-horse-danger)'" title="删除" />
        </div>
        <div v-if="currentId == itemId" class="absolute top-0 left-0">
            <star-horse-icon iconClass="check" :color="'var(--star-horse-style)'" title="选中" />
        </div>
        <!-- 新增右侧拖拽句柄 -->
        <div class="resize-handle right" @mousedown.prevent="startResize('right', $event)"></div>
        <!-- 新增底部拖拽句柄 -->
        <div class="resize-handle bottom" @mousedown.prevent="startResize('bottom', $event)"></div>

        <div class="relative flex flex-col h-full w-full overflow-hidden min-w-0 max-w-full">
            <draggable @add="(evt: Event) => onDragAdd(evt, compList)" class="w-full h-full min-w-[0]" tag="div"
                group="starHorseGroup" ghost-class="ghost" :list="compList" :itemKey="uuid()">
                <template #item="{ element: data, index }">
                    <div class="overflow-visible" :data-field-id="data.id" :key="data.id">
                        <component :key="data.id" :field="data" :isDesign="true" :index-of-parent-list="index"
                            :is="data.name + '-item'" v-bind="data.preps" style="min-width: 0; width: 100%;" />
                    </div>
                </template>
            </draggable>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.item-width {
    width: 100% !important;
}

.item-info {
    border-radius: 3px;
    padding: 1rem 1.5rem;
    cursor: pointer;
    min-width: 7rem;
    min-height: 5.5rem;
    max-width: 100%;
    background: #fefefe;
  /*   margin: 0 auto; */
    border: 3px solid var(--star-horse-style);
    position: relative;
    overflow: hidden;
    transition: background .3s ease, box-shadow .3s ease;

    &:hover .resize-handle {
        opacity: 1; // 悬停时显示
    }

    .resize-handle {
        opacity: 0; // 默认隐藏
        transition: opacity 0.2s ease;
        position: absolute;
        z-index: 20;
        background: rgba(105, 97, 97, 0.8);
        border-radius: 3px;
        box-shadow:
            0 0 4px rgba(0, 0, 0, 0.1),
            inset 0 0 4px rgba(255, 255, 255, 0.8);
        transition: all 0.2s ease;

        &:hover {
            transform: scale(1.2);
            background: rgba(146, 164, 183, 0.9);
        }

        &.right {
            cursor: col-resize;
            width: 10px;
            height: 40px;
            top: 50%;
            right: -5px;
            /* 调整到边框中间 */
            transform: translateY(-40%);
        }

        &.bottom {
            cursor: row-resize;
            height: 10px;
            width: 40px;
            left: 50%;
            bottom: -5px;
            /* 调整到边框中间 */
            transform: translateX(-40%);
        }
    }
}
</style>