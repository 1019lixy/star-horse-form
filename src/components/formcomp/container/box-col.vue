<script setup lang="ts" name="box-container">
import {computed, onMounted, PropType} from "vue";
import {i18n} from "@/lang";
// import piniaInstance from "@/store/index";
import {tableCellOperation} from "@/components/formcomp/container/dytableUtils";
import {itemCheck, uuid, warning} from "star-horse-lowcode";
import {getDesignFormStore} from "@/store/StoreManager";
import ContainerDropDown from "@/components/formcomp/utils/ContainerDropDown.vue";
import DesignItemWrapper from "@/components/formcomp/utils/DesignItemWrapper.vue";
import {CONTAINER_TYPES} from "./container-types";
import {useRowHeight} from "./container-utils";

const props = defineProps({
  parentField: {type: Object as PropType<any>},
  formInfo: {type: Object as PropType<any>},
  parentComp: {type: Object as PropType<any>},
  isDesign: {type: Boolean, default: false},
  showFormItem: {type: Boolean, default: false},
  disabled: {type: Object as PropType<Boolean | String>},
  field: {type: Object as PropType<any>},
  isFirstRow: {type: Boolean, default: false},
  isLastRow: {type: Boolean, default: false},
  isFirstCol: {type: Boolean, default: false},
  isLastCol: {type: Boolean, default: false},
  rowIndex: {type: Number, default: -1},
  colIndex: {type: Number, default: -1},
  compSize: {type: String, default: "default"},
});
let designForm = getDesignFormStore();
let draggingItem = computed(() => designForm.draggingItem);
const isDragging = computed(() => designForm.isDragging);
let currentSubItemId = computed(() => designForm.currentSubItemId);
let isEdit = computed(() => designForm.isEdit);
const formData = defineModel("formData");
const rowHeight = useRowHeight(() => props.compSize);
const onDragAdd = (evt: Event | any, dataList: any) => {
  selectCurrentTd();
  let newIndex = evt.newIndex;
  if (CONTAINER_TYPES.includes(draggingItem.value.itemType)) {
    warning(i18n("dyform.comp.container.443"));
    let elements = props.field.preps.elements;
    for (let inde in elements) {
      let element = elements[inde];
      for (let sind in element?.columns) {
        let column = element.columns[sind];
        for (let i in column?.items) {
          let item = column.items[i];
          if (draggingItem.value.id == item.id) {
            column.items.splice(i, 1);
          }
        }
      }
    }
    return false;
  }
  if (newIndex != null && newIndex != "undefined") {
    let dataInfo = dataList[newIndex];
    designForm.selectItem(dataInfo, dataInfo.itemType, "");
  }
};

const handleTableCellCommand = (command: string) => {
  tableCellOperation(command, props, "box");
};
const selectCurrentTd = () => {
  designForm.setSubItem(props.field);
};
const checkItem = (items: any) => {
  if (!items["items"]) {
    items["items"] = [];
  }
};
onMounted(() => {
});
//监控数据
</script>
<template>
  <el-col
      :span="field.colspan || 24"
      :offset="field.offset || 0"
      :push="field.push || 0"
      :pull="field.pull || 0"
      :xs="field.xs || undefined"
      :sm="field.sm || undefined"
      :md="field.md || undefined"
      :lg="field.lg || undefined"
      :xl="field.xl || undefined"
      :tag="field.tag || 'div'"
      :class="{ 'dragging-area': isDragging }"
      class="edit_col flex! items-center justify-center"
      :style="{ height: field.colHeight || '100%' }"
      @click="selectCurrentTd"
  >
    <div class="h-full w-full p-2 items-center justify-center flex flex-col" v-if="field.staticData===true"
         v-html="field.textContent"/>
    <draggable
        v-else
        @add="(evt: Event) => onDragAdd(evt, field.items)"
        @dragover="checkItem(field)"
        class="smain-design"
        tag="div"
        :disabled="!isEdit"
        item-key="id"
        group="starHorseGroup"
        ghostClass="container_ghost"
        animation="200"
        :list="field.items"
    >
      <template #item="{ element: data }">
        <div class="comp-item" :data-field-id="data?.id">
          <DesignItemWrapper :field="data" :isDesign="isDesign" :parentField="parentField" :disabled="disabled">
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
        v-if="isEdit && isDesign && currentSubItemId == field.id"
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
          :type="'box'"
          @command="handleTableCellCommand"
      />
    </div>
  </el-col>
</template>
<style lang="scss" scoped></style>
