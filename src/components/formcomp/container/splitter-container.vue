<script setup lang="ts">
import {computed, onMounted, PropType} from "vue";

import GroupContainer from "@/components/formcomp/container/group-container.vue";
import JSON5 from "json5";
import {itemCheck} from "star-horse-lowcode";
import {getDesignFormStore} from "@/store/StoreManager";
import {i18n} from "@/lang";
import {quickAddItem} from "@/api/form_utils";
import DesignItemWrapper from "@/components/formcomp/utils/DesignItemWrapper.vue";
import {ensureDefaultElements} from "./container-types";
import {useDragAdd, ensureItems} from "./container-utils";
import {useInlineEdit} from "./useInlineEdit";

defineOptions({
  name: "SplitterContainer",
});
const props = defineProps({
  parentField: {type: Object as PropType<any>},
  isDesign: {type: Boolean, default: false},
  showFormItem: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  formInfo: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
});
let designForm = getDesignFormStore();
const isDragging = computed(() => designForm.isDragging);
const formData = defineModel("formData");

const {onDragAdd} = useDragAdd(designForm);
const checkItem = (adata: any) => ensureItems(adata);
const {editingId, editingText, startEditName, finishEditName} = useInlineEdit(() => props.isDesign, "splitter-edit-input");

const checkData = (adata: any) => {
  // 优先读取独立命名字段（新方案），兼容旧版 JSON preps 字符串
  let raw: any = null;
  if (adata.preps && typeof adata.preps === "string" && adata.preps.trim()) {
    try {
      raw = JSON5.parse(adata.preps);
    } catch (e) {
      console.log(e);
    }
  } else if (adata.preps && typeof adata.preps === "object") {
    raw = adata.preps;
  }
  const pick = (key: string) => {
    if (adata[key] !== undefined) return adata[key];
    if (raw && raw[key] !== undefined) return raw[key];
    return undefined;
  };
  const result: any = {};
  const size = pick("size");
  const min = pick("min");
  const max = pick("max");
  const resizable = pick("resizable");
  const collapsible = pick("collapsible");
  if (size !== undefined) result.size = size;
  if (min !== undefined) result.min = min;
  if (max !== undefined) result.max = max;
  if (resizable !== undefined) result.resizable = resizable;
  if (collapsible !== undefined) result.collapsible = collapsible;
  return result;
};
onMounted(() => {
  ensureDefaultElements(props.field, "splitter");
  designForm.setCurrentSubTabName("");
});
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
    <el-splitter
        :layout="field?.preps?.layout ?? 'horizontal'"
        :lazy="field?.preps?.lazy"
    >
      <el-splitter-panel
          v-for="adata in field['preps']['elements']"
          v-bind="checkData(adata)"
      >
        <div class="splitter-panel-header" v-if="isDesign">
          <span
              v-if="editingId !== (adata.subTablePrimaryKey || adata.subTableName)"
              class="editable-name"
              @dblclick.stop="startEditName(adata)"
          >{{ adata.label || adata.subTableName }}</span>
          <el-input
              v-else
              class="splitter-edit-input"
              v-model="editingText"
              size="small"
              @blur="finishEditName(adata)"
              @keyup.enter="finishEditName(adata)"
              @click.stop
              style="width: 120px;"
          />
        </div>
        <draggable
            @add="(evt: Event) => onDragAdd(evt, adata['items'])"
            @dragover="checkItem(adata)"
            class="card-design"
            :class="{ 'dragging-area': isDragging }"
            group="starHorseGroup"
            animation="100"
            item-key="id"
            ghostClass="ghost"
            :list="adata['items']"
        >
          <template #item="{ element: data }">
            <div class="comp-item  my-[5px]" :data-field-id="data.id">
              <DesignItemWrapper :field="data" :isDesign="isDesign" :parentField="field" :disabled="disabled">
                <component
                    :key="data.id"
                    :field="data"
                    :isDesign="isDesign"
                    :disabled="disabled"
                    :showFormItem="showFormItem"
                    :formInfo="formInfo"
                    :is="itemCheck(data)"
                    :parentField="field"
                    v-model:formData="formData"
                />
              </DesignItemWrapper>
            </div>
          </template>
        </draggable>

        <!-- 快捷添加组件按钮 -->
        <div v-if="isDesign" class="quick-add-bar">
          <el-button size="small" type="info" plain @click.stop="quickAddItem(adata.items)" icon="Plus">
            {{ i18n("dyform.condition.addLeaf") }}
          </el-button>
        </div>
      </el-splitter-panel>
    </el-splitter>
  </group-container>
</template>
<style lang="scss" scoped>
:deep(.el-card) {
  margin-top: 10px;
}

:deep(.el-card__body) {
  margin-top: 5px;
}

.splitter-panel-header {
  padding: 4px 8px;
  font-size: 12px;
  color: #909399;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}

.editable-name {
  cursor: text;
  border-bottom: 1px dashed transparent;
  transition: border-color 0.2s;

  &:hover {
    border-bottom-color: #409eff;
  }
}

.quick-add-bar {
  display: flex;
  justify-content: center;
  padding: 4px 0;
  margin-top: 4px;
  border: 1px dashed #d9ecff;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    border-color: #409eff;
    background: #ecf5ff;
  }
}
</style>
