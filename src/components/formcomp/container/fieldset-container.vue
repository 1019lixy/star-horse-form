<script setup lang="ts" name="fieldset-container">
import { onMounted, PropType, ref } from "vue";
import { itemCheck } from "star-horse-lowcode";
import { getDesignFormStore } from "@/store/StoreManager";
import { i18n } from "@/lang";
import { quickAddItem } from "@/api/form_utils";
import DesignItemWrapper from "@/components/formcomp/utils/DesignItemWrapper.vue";
import { isContainer, ensureDefaultElements } from "./container-types";
import { useDragAdd, ensureItems } from "./container-utils";
import { useInlineEdit } from "./useInlineEdit";

const props = defineProps({
  parentField: { type: Object as PropType<any> },
  isDesign: { type: Boolean, default: false },
  showFormItem: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  formInfo: { type: Object as PropType<any> },
  field: { type: Object as PropType<any> },
});
let designForm = getDesignFormStore();
const formData = defineModel("formData");
const innerCollapsed = ref(false);
const toggleInner = () => {
  if (props.field?.preps?.collapsible)
    innerCollapsed.value = !innerCollapsed.value;
};

const { onDragAdd } = useDragAdd(designForm);
const checkItem = (adata: any) => ensureItems(adata);
const {
  editingId,
  editingText,
  startEditName: startEditTitle,
  finishEditName: finishEditTitle,
} = useInlineEdit(() => props.isDesign, "fieldset-edit-input");
const editingTitle = ref(false);
const titleInputRef = ref();

onMounted(() => {
  ensureDefaultElements(props.field, "fieldset");
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
    <fieldset
      v-for="adata in field['preps']['elements']"
      class="fieldset-container"
      :class="{
        'border-dashed': field.preps['borderStyle'] === 'dashed',
        'border-none': field.preps['borderStyle'] === 'none',
        'is-collapsible': field.preps['collapsible'],
        'is-collapsed': innerCollapsed,
      }"
      :disabled="field.preps['fieldsetDisabled'] || false"
      :form="field.preps['fieldsetForm'] || undefined"
      :name="field.preps['fieldsetName'] || undefined"
    >
      <legend
        class="fieldset-legend"
        :class="{ clickable: field.preps['collapsible'] }"
        @click="toggleInner"
      >
        <svg
          v-if="field.preps['collapsible']"
          :class="['legend-arrow', { rotated: innerCollapsed }]"
          viewBox="0 0 10 6"
          fill="none"
          width="10"
          height="10"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <span
          v-if="editingId !== (adata.subTablePrimaryKey || adata.subTableName)"
          class="legend-text"
          :class="{ editable: isDesign }"
          @dblclick.stop="startEditTitle(adata)"
        >
          {{
            adata.title ||
            (isDesign ? i18n("dyform.container.fieldsetTitlePlaceholder") : "")
          }}
        </span>
        <!-- 设计模式: 双击编辑标题 -->
        <el-input
          v-else
          class="fieldset-edit-input"
          v-model="adata.title"
          size="small"
          style="width: 200px"
          @blur="finishEditTitle(adata)"
          @keyup.enter="finishEditTitle(adata)"
        />
      </legend>
      <div v-show="!adata.preps?.innerCollapsed" class="fieldset-body">
        <draggable
          :key="adata.subTablePrimaryKey"
          @add="(evt: Event) => onDragAdd(evt, adata['items'])"
          @dragover="checkItem(adata)"
          class="fieldset-design"
          :class="{ 'dragging-area': designForm.isDragging }"
          group="starHorseGroup"
          animation="100"
          item-key="id"
          ghostClass="ghost"
          v-model="adata['items']"
        >
          <template #item="{ element: item }">
            <div class="comp-item" :data-field-id="item.id">
              <DesignItemWrapper
                :field="item"
                :isDesign="isDesign"
                :parentField="field"
                :disabled="disabled"
              >
                <component
                  :key="item.id"
                  :field="item"
                  :isDesign="isDesign"
                  :disabled="disabled"
                  :showFormItem="showFormItem"
                  :formInfo="formInfo"
                  :is="itemCheck(item)"
                  :parentField="field"
                  v-model:formData="formData"
                />
              </DesignItemWrapper>
            </div>
          </template>
        </draggable>
        <div v-if="isDesign" class="quick-add-bar">
          <el-button
            size="small"
            type="info"
            plain
            @click.stop="quickAddItem(field.preps.elements[0].items)"
            icon="Plus"
          >
            {{ i18n("dyform.condition.addLeaf") }}
          </el-button>
        </div>
      </div>
    </fieldset>
  </group-container>
</template>

<style lang="scss" scoped>
.fieldset-container {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 12px 16px 8px;
  margin: 0;
  position: relative;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-color: #c0c4cc;
  }

  &.border-dashed {
    border-style: dashed;
  }

  &.border-none {
    border: none;
    padding: 4px 0;
  }

  &.is-collapsible .fieldset-legend {
    cursor: pointer;
    user-select: none;
  }

  &.is-collapsed {
    padding-bottom: 12px;
  }
}

.fieldset-legend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  // background: #fff;

  &.clickable:hover {
    color: var(--star-horse-style, #409eff);
  }
}

.legend-text {
  &.editable {
    cursor: text;
    border-bottom: 1px dashed transparent;

    &:hover {
      border-bottom-color: var(--star-horse-style, #409eff);
    }
  }
}

.legend-arrow {
  transition: transform 0.2s ease;
  color: #909399;

  &.rotated {
    transform: rotate(-90deg);
  }
}

.fieldset-body {
  padding-top: 4px;
}

.fieldset-design {
  min-height: 40px;
}

.dragging-area {
  background: #fdf6ec;
  outline: 2px dashed #e6a23c;
  outline-offset: -2px;
  border-radius: 4px;
}

.quick-add-bar {
  display: flex;
  justify-content: center;
  padding: 4px 0;
  margin-top: 4px;
  border: 1px dashed #f5dab1;
  border-radius: 4px;

  &:hover {
    background: #fdf6ec;
    border-color: #e6a23c;
  }
}
</style>
