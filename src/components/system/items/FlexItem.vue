<script setup lang="ts">
import { useFlexDesignStore } from '@/store/FlexDesign';
import { piniaInstance, uuid,itemCheck } from 'star-horse-lowcode';
import { computed, defineOptions, onMounted, ref } from 'vue';

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
const list = ref<any[]>([]);
const formData = ref<any>({});
const selectItem = () => {
    flexDesign.setCurrentItem(props.itemId);
    emit("selectItem", props.itemId);
}
const deleteItem = () => {
    flexDesign.delItem(props.itemId);
}
const onDragAdd = (evt: Event, list: any[]) => {
  
}

const init = () => {

}
onMounted(() => {
    init();
})
</script>
<template>
    <div :style="itemStyle" @click.stop="selectItem" class="item-info"
        :class="{ 'w-full': type == 'grid', 'item-width': containerDirection.includes('column') }">
        <div class="absolute top-0 right-0 z-10" @click.stop="deleteItem">
            <star-horse-icon iconClass="delete" :cursor="'pointer'" :color="'var(--star-horse-danger)'" title="删除" />
        </div>
        <div v-if="currentId == itemId" class="absolute top-0 left-0">
            <star-horse-icon iconClass="check" :color="'var(--star-horse-style)'" title="选中" />
        </div>
        <div class="relative flex flex-col h-full w-full overflow-hidden min-w-0">
            <draggable @add="(evt: Event) => onDragAdd(evt, compList)"  class="w-full"
                :style="{width: '100%', minWidth: 0}"
                tag="div" group="starHorseGroup" ghost-class="ghost" :list="compList" :itemKey="uuid()">
                <template #item="{ element: data, index }">
                    <div :class="{ 'comp-item': data.preps?.headerFlag == 'Y' }" class="overflow-visible"
                        :data-field-id="data.id" :key="data.id">
                        <component :key="data.id" :field="data" :isDesign="true" :index-of-parent-list="index"
                            :is="itemCheck(data)" v-model:formData="formData" />
                    </div>
                </template>
            </draggable>
            {{compList}}
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
    background: #fefefe;
    margin: 0 auto;
    border: 3px solid var(--star-horse-style);
    box-shadow: 3px 3px 0 0 var(--star-horse-style);
    position: relative;
    transition: background .3s ease, box-shadow .3s ease;
}
</style>