<script setup lang="ts" name="box-container">
import {computed, PropType, ref} from "vue";
import GroupContainer from "@/components/formcomp/container/group-container.vue";
import BoxCol from "@/components/formcomp/container/box-col.vue";

const props = defineProps({
  parentField: { type: Object as PropType<any> },
  isDesign: { type: Boolean, default: false },
  showFormItem: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  formInfo: { type: Object as PropType<any> },
  field: { type: Object as PropType<any> },
  compSize: { type: String, default: "default" },
});
const formData = defineModel("formData");
const rowHeight = computed(() => {
  if (props.compSize == "large") {
    return "45px";
  } else if (props.compSize == "small") {
    return "35px";
  } else {
    return "40px";
  }
});
//─── 设计态行高拖拽（仅 isDesign）───
//拖拽中的行下标（-1 表示未拖拽），用于行高亮与光标锁定
const resizingRowIndex = ref(-1);
const startY = ref(0);
const startHeight = ref(0);
const rowHeightOf = (element: any) =>
  element.rowHeight || props.field.colHeight || rowHeight.value;
//行底部按下且处于设计态时开始拖拽（与 dytable-col 的 handleResizeStart 语义一致：
//底部 8px 命中区，拖动写入行对象 rowHeight，最小 20px）
const handleRowResizeStart = (e: MouseEvent, element: any, rowIndex: number) => {
  if (!props.isDesign || e.button !== 0) {
    return;
  }
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  if (e.clientY <= rect.bottom - 8) {
    return;
  }
  e.preventDefault();
  resizingRowIndex.value = rowIndex;
  startY.value = e.clientY;
  startHeight.value = rect.height;
  document.addEventListener("mousemove", handleRowResizeMove);
  document.addEventListener("mouseup", handleRowResizeEnd);
};
const handleRowResizeMove = (e: MouseEvent) => {
  if (resizingRowIndex.value < 0) {
    return;
  }
  const delta = e.clientY - startY.value;
  const element = props.field.preps.elements[resizingRowIndex.value];
  if (element) {
    element.rowHeight = `${Math.max(20, startHeight.value + delta)}px`;
  }
};
const handleRowResizeEnd = () => {
  resizingRowIndex.value = -1;
  document.removeEventListener("mousemove", handleRowResizeMove);
  document.removeEventListener("mouseup", handleRowResizeEnd);
};
</script>
<template>
  <group-container
    class="star-horse-form-container"
    :showFormItem="showFormItem"
    :isDesign="isDesign"
    :disabled="disabled"
    :parentField="parentField"
    :form-item="field"
  >
    <el-row
      v-for="(element, rowIndex) in field.preps.elements"
      :class="['box-row', isDesign ? 'box-row-design' : '', resizingRowIndex == Number(rowIndex) ? 'is-resizing' : '']"
      :gutter="field.preps?.gutter || 1"
      :justify="field.preps?.justify || 'start'"
      :align="field.preps?.align || 'top'"
      :tag="field.preps?.tag || 'div'"
      :style="{
        width: field.colWidth || '100%',
        height: rowHeightOf(element),
      }"
      @mousedown="handleRowResizeStart($event, element, Number(rowIndex))"
    >
      <template v-for="(col, colIndex) in element.columns">
        <box-col
          :field="col"
          :formInfo="formInfo"
          v-model:formData="formData"
          :isDesign="isDesign"
          :showFormItem="showFormItem"
          :disabled="disabled"
          :isFirstRow="rowIndex == 0"
          :parentField="field"
          :isLastRow="rowIndex == field.preps.elements.length - 1"
          :isFirstCol="colIndex == 0"
          :isLastCol="colIndex == element.columns.length - 1"
          :rowIndex="Number(rowIndex)"
          :colIndex="Number(colIndex)"
        />
      </template>
    </el-row>
  </group-container>
</template>
<style lang="scss" scoped>
/*设计态行高拖拽：行底部 8px 命中区显示 row-resize 手柄（视觉与 dytable-col 一致）*/
.box-row {
  position: relative;
  &.box-row-design::after {
    content: "";
    position: absolute;
    left: 10%;
    width: 80%;
    bottom: -2px;
    height: 4px;
    pointer-events: auto;
    cursor: row-resize;
    background: var(--star-horse-style);
    opacity: 0;
    transition: opacity 0.3s;
  }
  &.box-row-design:hover::after,
  &.is-resizing::after {
    opacity: 0.5;
  }
  &.is-resizing {
    background: rgba(64, 158, 255, 0.1);
  }
}
</style>
