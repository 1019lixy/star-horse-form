<script setup lang="ts" name="gridtable-col">
import { computed, onMounted, PropType, ref } from "vue";
import { tableCellOperation } from "@/components/formcomp/container/gridtableUtils";
import { itemCheck, uuid } from "star-horse-lowcode";
import { getDesignFormStore } from "@/store/StoreManager";
import ContainerDropDown from "@/components/formcomp/utils/ContainerDropDown.vue";
import DesignItemWrapper from "@/components/formcomp/utils/DesignItemWrapper.vue";
import { useRowHeight, useDropGuard } from "./container-utils";

const props = defineProps({
  parentField: { type: Object as PropType<any> },
  formInfo: { type: Object as PropType<any> },
  parentComp: { type: Object as PropType<any> },
  isDesign: { type: Boolean, default: false },
  showFormItem: { type: Boolean, default: false },
  disabled: { type: Object as PropType<Boolean | String> },
  field: { type: Object as PropType<any> },
  isFirstRow: { type: Boolean, default: false },
  isLastRow: { type: Boolean, default: false },
  isFirstCol: { type: Boolean, default: false },
  isLastCol: { type: Boolean, default: false },
  rowIndex: { type: Number, default: -1 },
  colIndex: { type: Number, default: -1 },
  actionColIndex: { type: Number, default: -1 },
  compSize: { type: String, default: "default" },
  gridPosition: {
    type: Object as PropType<{ gridColumn: string; gridRow: string }>,
    default: () => ({}),
  },
  showLineNumber: { type: Boolean, default: true },
});
let designForm = getDesignFormStore();
let currentSubItemId = computed(() => designForm.currentSubItemId);
const isDragging = computed(() => designForm.isDragging);
const formData = defineModel("formData");
const rowHeight = useRowHeight(() => props.compSize);
const rowSpan = computed(() => props.field.rowspan || 1);
const cellStyle = computed(() => {
  const style: Record<string, any> = {
    width: props.field.colWidth || "100%",
    gridColumn: props.gridPosition.gridColumn,
    gridRow: props.gridPosition.gridRow,
    "word-break": !!props.field.wordBreak ? "break-all" : "normal",
    "text-overflow": "ellipsis",
  };
  if (rowSpan.value > 1) {
    style["height"] = props.field.colHeight || "auto";
  } else {
    style["height"] = props.field.colHeight || rowHeight;
  }
  return style;
});
const isResizing = ref(false);
const resizeDirection = ref<"height" | null>(null);
const startY = ref(0);
const startHeight = ref(0);
const { moveHandler, guardAdd } = useDropGuard("gridtable");

const onDragAdd = (evt: Event | any, dataList: any) => {
  selectCurrentTd();
  let newIndex = evt.newIndex;
  if (!guardAdd(dataList, newIndex)) return;
  if (newIndex != null && newIndex != "undefined") {
    let dataInfo = dataList[newIndex];
    dataInfo.preps["hideLabel"] = true;
    designForm.selectItem(dataInfo, dataInfo.itemType, "");
  }
};

const handleTableCellCommand = (command: string) => {
  tableCellOperation(command, props);
};
const selectCurrentTd = () => {
  designForm.setSubItem(props.field);
};
const handleResizeStart = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest(".table-cell-action")) return;
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const isHeightResize = e.clientY > rect.bottom - 8;
  if (isHeightResize) {
    e.preventDefault();
    isResizing.value = true;
    resizeDirection.value = "height";
    startY.value = e.clientY;
    startHeight.value = rect.height;
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  }
};
const handleResizeMove = (e: MouseEvent) => {
  if (!isResizing.value || resizeDirection.value !== "height") return;
  const delta = e.clientY - startY.value;
  const newHeight = startHeight.value + delta;
  props.field.colHeight = `${Math.max(20, newHeight)}px`;
};
const handleResizeEnd = () => {
  isResizing.value = false;
  resizeDirection.value = null;
  document.removeEventListener("mousemove", handleResizeMove);
  document.removeEventListener("mouseup", handleResizeEnd);
};
onMounted(() => {});
</script>
<template>
  <div
    class="gridtable-cell edit_col"
    :class="{
      'dragging-area': isDragging,
      'no-drag': !isDesign,
    }"
    :style="cellStyle"
    @click="selectCurrentTd"
    @mousedown="handleResizeStart"
  >
    <div
      class="h-full w-full p-2 items-center justify-center flex flex-col"
      v-if="field.staticData === true"
      v-html="field.textContent"
    />
    <draggable
      v-else
      @add="(evt: Event) => onDragAdd(evt, field.items)"
      :move="moveHandler"
      class="smain-design"
      tag="div"
      item-key="id"
      group="starHorseGroup"
      ghostClass="container_ghost"
      animation="200"
      :list="field.items"
    >
      <template #item="{ element: data }">
        <div
          :class="{
            'comp-item': data?.preps?.headerFlag != 'Y',
            'bare-item': data?.preps?.headerFlag,
          }"
          :data-field-id="data?.id"
          style="height: 100%"
        >
          <DesignItemWrapper
            :field="data"
            :isDesign="isDesign"
            :parentField="parentField"
            :disabled="disabled"
          >
            <component
              :key="data?.id"
              :field="data"
              :formInfo="formInfo"
              :isDesign="isDesign"
              :showFormItem="showFormItem"
              :disabled="disabled"
              :is="itemCheck(data)"
              :parentField="parentField"
              v-model:formData="formData"
            />
          </DesignItemWrapper>
        </div>
      </template>
    </draggable>
    <div
      class="table-cell-action"
      v-if="isDesign && currentSubItemId == field.id"
    >
      <ContainerDropDown
        :field="field"
        :parentField="parentField"
        :isFirstCol="isFirstCol"
        :isLastCol="isLastCol"
        :isFirstRow="isFirstRow"
        :isLastRow="isLastRow"
        :disabled="disabled"
        :rowIndex="rowIndex"
        :colIndex="colIndex"
        :type="'gridtable'"
        @command="handleTableCellCommand"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.gridtable-cell {
  border: 1px solid var(--star-horse-style);
  position: relative;
  display: block !important;
  overflow: visible;
}
.edit_col {
  &::before {
    content: "";
    position: absolute;
    left: 10%;
    right: 0;
    bottom: -3px;
    height: 6px;
    pointer-events: auto;
    cursor: row-resize;
    width: 80%;
    background: var(--star-horse-style);
    opacity: 0;
    transition:
      opacity 0.3s,
      bottom 0.1s;
    //  z-index: 500;
  }
  &:hover {
    &::before {
      opacity: 0.5;
    }
  }
  &.is-resizing {
    background: rgba(64, 158, 255, 0.1);
  }
  &.no-drag {
    &::before {
      display: none !important;
      pointer-events: none !important;
    }
    &:hover {
      &::before {
        opacity: 0 !important;
      }
    }
  }
}
</style>
