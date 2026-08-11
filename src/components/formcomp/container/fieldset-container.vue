<script setup lang="ts" name="fieldset-container">
import {onMounted, PropType, ref, nextTick} from "vue";
import {getDesignFormStore, itemCheck} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {quickAddItem} from "@/api/form_utils";

const props = defineProps({
  parentField: {type: Object as PropType<any>},
  isDesign: {type: Boolean, default: false},
  showFormItem: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  formInfo: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
});
let designForm = getDesignFormStore();
const formData = defineModel("formData");
let containerType: Array<string> = [
  "tab", "box", "table", "card", "dytable", "collapse", "splitter", "step", "condition",
  "dialog", "drawer", "fieldset", "descriptions", "anchor",
];
const isContainer = (data: any) => containerType.includes(data.itemType);
const innerCollapsed = ref(false);
const toggleInner = () => {
  if (props.field?.preps?.collapsible) innerCollapsed.value = !innerCollapsed.value;
};

// 标题内联编辑
const editingTitle = ref(false);
const titleInputRef = ref();
const startEditTitle = () => {
  if (!props.isDesign) return;
  editingTitle.value = true;
  nextTick(() => {
    titleInputRef.value?.focus();
    titleInputRef.value?.select();
  });
};
const finishEditTitle = () => {
  editingTitle.value = false;
  if (!props.field.preps['fieldsetTitle']) {
    props.field.preps['fieldsetTitle'] = '';
  }
};

const onDragAdd = (evt: Event | any, dataList: any) => {
  let newIndex = evt.newIndex;
  if (newIndex != null && newIndex != "undefined") {
    let dataInfo = dataList[newIndex];
    designForm.selectItem(dataInfo, dataInfo.itemType, "");
  }
};

const checkItem = (adata: any) => {
  if (!adata["items"]) adata["items"] = [];
};

onMounted(() => {
  if (!props.field["preps"]) props.field["preps"] = {};
  if (!props.field["preps"]?.["elements"]) {
    props.field["preps"]["elements"] = [
      {label: "Fieldset", tabName: "fieldset", objectName: "fieldset", subFormFlag: "Y", items: []},
    ];
  }
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
        class="fieldset-container"
        :class="{
          'border-dashed': field.preps['borderStyle'] === 'dashed',
          'border-none': field.preps['borderStyle'] === 'none',
          'is-collapsible': field.preps['collapsible'],
          'is-collapsed': innerCollapsed
        }"
    >
      <legend
          class="fieldset-legend"
          :class="{ 'clickable': field.preps['collapsible'] }"
          @click="toggleInner"
      >
        <svg
            v-if="field.preps['collapsible']"
            :class="['legend-arrow', { 'rotated': innerCollapsed }]"
            viewBox="0 0 10 6" fill="none" width="10" height="10"
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <!-- 设计模式: 双击编辑标题 -->
        <el-input
            v-if="editingTitle && isDesign"
            ref="titleInputRef"
            v-model="field.preps['fieldsetTitle']"
            size="small"
            style="width: 200px"
            @blur="finishEditTitle"
            @keyup.enter="finishEditTitle"
        />
        <span
            v-else
            class="legend-text"
            :class="{ 'editable': isDesign }"
            @dblclick.stop="startEditTitle"
        >
          {{ field.preps['fieldsetTitle'] || (isDesign ? i18n('dyform.container.fieldsetTitlePlaceholder') : '') }}
        </span>
      </legend>
      <div v-show="!innerCollapsed" class="fieldset-body">
        <draggable
            v-for="adata in field['preps']['elements']"
            :key="adata.tabName"
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
            </div>
          </template>
        </draggable>
        <div v-if="isDesign" class="quick-add-bar">
          <el-button size="small" type="info" plain @click.stop="quickAddItem(field.preps.elements[0].items)" icon="Plus">
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
  transition: border-color 0.2s, box-shadow 0.2s;

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
