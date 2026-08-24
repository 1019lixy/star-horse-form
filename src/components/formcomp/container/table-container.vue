<script setup lang="ts" name="table-container">
// 右键菜单组件
import {computed, PropType, ref} from "vue";
import {i18n} from "@/lang";
import GroupContainer from "@/components/formcomp/container/group-container.vue";
import {itemCheck, operationConfirm} from "star-horse-lowcode";
import {getDesignFormStore} from "@/store/StoreManager";
import {useDropGuard, useRowHeight} from "./container-utils";
import DesignItemWrapper from "@/components/formcomp/utils/DesignItemWrapper.vue";

let containerTableRef = ref(); // 强制刷新表格
const props = defineProps({
  parentField: { type: Object as PropType<any> },
  isDesign: { type: Boolean, default: false },
  showFormItem: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  formInfo: { type: Object as PropType<any> },
  field: { type: Object as PropType<any> },
  compSize: { type: String, default: "default" },
});
let designForm = getDesignFormStore();
let isEdit = computed(() => props.isDesign);
const isDragging = computed(() => designForm.isDragging);
const formData = defineModel("formData");
const rowHeight = useRowHeight(() => props.compSize);
const { moveHandler, guardAdd } = useDropGuard("table");
const staticColumn = computed(() => props.field?.preps?.staticColumn || "N");
const dialogType = computed(() => props.field?.preps?.dialogType || "dialog");
const onDragAdd = (evt: Event | any, dataList: any) => {
  let newIndex = evt.newIndex;
  if (!guardAdd(dataList, newIndex)) return;
  if (newIndex != null && newIndex != "undefined") {
    let dataInfo = dataList[newIndex];
    designForm.selectItem(dataInfo, dataInfo.itemType, "");
  }
};
const columnElements = computed(() => props.field?.preps?.elements || []);
const columnCount = computed(() => parseInt(props.field?.preps?.columns || 1));
const analysisData = (index: number) => {
  const elements = columnElements.value;
  const col = elements.find((item: any) => item.colIndex == index);
  if (index > 1 && !col) {
    elements.push({ colIndex: index, items: [] });
  }
  return col?.items[0]?.preps?.label || `Title${index}`;
};
let currentIndex = ref<number>(-1);
const tdOver = (evt: MouseEvent, index: number) => {
  evt.preventDefault();
  evt.stopPropagation();
  if (currentIndex.value == index) return;
  currentIndex.value = index;
};
const tdOut = (evt: MouseEvent) => {
  evt.preventDefault();
  evt.stopPropagation();
  currentIndex.value = -1;
};
const deleteCol = (index: number) => {
  operationConfirm(i18n("table.confirmDeleteColumn")).then((res: boolean) => {
    if (!res) return;
    const elements = props.field.preps.elements;
    elements.splice(index - 1, 1);
    elements.forEach((item: any, i: number) => {
      item.colIndex = i + 1;
    });
    props.field.preps.columns = elements.length;
    currentIndex.value = -1;
  });
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
    <div v-if="isDesign && staticColumn === 'Y'" class="table-edit-mode-hint">
      <star-horse-icon icon-class="edit" color="var(--el-color-primary)" />
      <span
        >{{
          dialogType === "drawer"
            ? i18n("dyform.container.cfg.tableDialogTypeDrawer")
            : i18n("dyform.container.cfg.tableDialogTypeDialog")
        }}{{ i18n("dyform.container.cfg.tableStaticColumnY") }}</span
      >
    </div>
    <table
      ref="containerTableRef"
      class="dynamic-table"
      :class="{ 'striped-table': field.preps['striped'] }"
      :border="
        field.preps['tableBorder'] !== undefined
          ? field.preps['tableBorder']
            ? 1
            : 0
          : 1
      "
      :cellpadding="
        field.preps['cellpadding'] !== undefined
          ? field.preps['cellpadding']
          : 5
      "
      :cellspacing="
        field.preps['cellspacing'] !== undefined
          ? field.preps['cellspacing']
          : 0
      "
      :style="{
        width: field.preps['tableWidth'] || '100%',
        border:
          isEdit && isDesign
            ? '1px solid #dfe6ec'
            : field.preps['tableBorder'] === false
              ? 'none'
              : '1px solid #dfe6ec',
      }"
    >
      <thead class="container-thead" v-if="field.preps['showHeader'] !== false">
        <tr>
          <th
            v-for="td of columnCount"
            @mouseenter="(evt) => tdOver(evt, td)"
            @mouseleave="(evt) => tdOut(evt)"
          >
            <div class="td-operator" v-if="currentIndex == td && isDesign">
              <el-tooltip :content="i18n('dyform.comp.container.441')">
                <star-horse-icon
                  icon-class="delete"
                  cursor="pointer"
                  color="var(--el-color-danger)"
                  @click="deleteCol(td)"
                />
              </el-tooltip>
            </div>
            {{ analysisData(td) }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr class="dy-tr">
          <template v-for="td of columnCount">
            <td
              :style="{
                width: field.colWidth || '100%',
                height: field.colHeight || rowHeight,
                'word-break': !!field.wordBreak ? 'break-all' : 'normal',
                'text-overflow': 'ellipsis',
              }"
              class="edit_col dy-cell"
              :class="{
                'dragging-area': isDragging,
                'no-drag': !isDesign,
              }"
              @mouseenter="(evt) => tdOver(evt, td)"
              @mouseleave="(evt) => tdOut(evt)"
            >
              <draggable
                @add="
                  (evt: Event) =>
                    onDragAdd(evt, field.preps.elements[td - 1].items)
                "
                :move="moveHandler"
                class="smain-design"
                tag="div"
                group="starHorseGroup"
                ghostClass="container_ghost"
                animation="200"
                item-key="id"
                :list="field.preps.elements[td - 1].items"
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
                      :parentField="field"
                      :disabled="disabled"
                    >
                      <component
                        :key="data?.id"
                        :field="data"
                        :showFormItem="showFormItem"
                        :isDesign="isDesign"
                        :disabled="disabled"
                        :formInfo="formInfo"
                        :is="itemCheck(data)"
                        :parentField="field"
                        v-model:formData="formData"
                      />
                    </DesignItemWrapper>
                  </div>
                </template>
              </draggable>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </group-container>
</template>
<style lang="scss" scoped>
/*table {
  display: table;
  border-collapse: separate;
  box-sizing: border-box;
  text-indent: initial;
  unicode-bidi: isolate;
  border-spacing: 2px;
  border-color: gray;
}

tr {
  display: table-row;
  vertical-align: inherit;
  unicode-bidi: isolate;
  border-color: inherit;
}*/

.container-thead tr {
  background: var(--star-horse-shadow);
  display: table-row;
  vertical-align: inherit;
  unicode-bidi: isolate;
  height: 35px;
  border-radius: 3px;
  margin-bottom: 5px;
  border: 1px solid #dfe6ec;
}

th {
  position: relative;
  border: 1px solid #dfe6ec;
  table-layout: fixed;

  .td-operator {
    position: absolute;
    right: 0;
    top: 0;
    //    z-index: 9999;
  }
}

tr {
  width: 100%;
}

.td-clz {
  flex-direction: row;
  padding: 5px;
  border: 1px solid #dfe6ec;
  border-top: none;
  height: 35px;
}

.comp-item {
  margin: unset;
}

.dynamic-table {
  width: 100%;
  border-collapse: collapse;

  thead {
    background: var(--star-horse-font-color);
    height: 30px;
    font-size: 14px;
  }
}

.table-edit-mode-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  margin-bottom: 6px;
  border: 1px dashed var(--el-color-primary);
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 12px;
}

.striped-table tbody tr:nth-child(odd) {
  background: #fafafa;
}
</style>
