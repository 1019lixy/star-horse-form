<script setup lang="ts" name="descriptions-container">
import {nextTick, onMounted, PropType, ref} from "vue";
import {itemCheck} from "star-horse-lowcode";
import {getDesignFormStore} from "@/store/StoreManager";
import {i18n} from "@/lang";
import {quickAddItem} from "@/api/form_utils";
import DesignItemWrapper from "@/components/formcomp/utils/DesignItemWrapper.vue";
import GroupContainer from "@/components/formcomp/container/group-container.vue";
import {ensureDefaultElements} from "./container-types";
import {ensureItems} from "./container-utils";

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

const onDragAdd = (evt: Event | any, dataList: any) => {
  let newIndex = evt.newIndex;
  if (newIndex != null && newIndex != "undefined") {
    let dataInfo = dataList[newIndex];
    designForm.selectItem(dataInfo, dataInfo.itemType, "");
  }
};
// 双击编辑相关
const editingId = ref<string>("");
const editingText = ref<string>("");

const startEditName = (element: any) => {
  if (!props.isDesign) return;
  editingId.value = element.fieldName;
  editingText.value = element.preps?.label || "";
  nextTick(() => {
    const input = document.querySelector(
      `.descriptions-edit-input input`,
    ) as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  });
};

const finishEditName = (element: any) => {
  if (editingText.value.trim()) {
    element.preps.label = editingText.value.trim();
    element.label = element.preps?.label;
  }
  editingId.value = "";
};
const checkItem = (adata: any) => ensureItems(adata);

// 获取所有items(合并所有element的items)
const allItems = () => {
  const elements = props.field?.preps?.elements || [];
  let items: any[] = [];
  elements.forEach((el: any) => {
    if (el.items) items = items.concat(el.items);
  });
  return items;
};
const getItem = (item: any) => {
  const newItem = { ...item };
  newItem.preps.hideLabel = true;
  return newItem;
};
onMounted(() => {
  ensureDefaultElements(props.field, "descriptions");
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
    <el-descriptions
      :title="field.preps['descTitle'] || ''"
      :direction="field.preps['direction'] || 'horizontal'"
      :column="field.preps['column'] || 3"
      :border="field.preps['border'] !== false"
      :size="field.preps['size'] || 'default'"
      :extra="field.preps['descExtra'] || ''"
      :label-width="field.preps['descItemLabelWidth'] || ''"
    >
      <template
        v-for="adata in field['preps']['elements']"
        :key="adata.subTablePrimaryKey"
      >
        <el-descriptions-item
          v-for="item in adata['items']"
          :key="item.id"
          :label="item.preps?.label || item.fieldName"
          :rowspan="field.preps['descItemRowspan'] || 1"
          :align="field.preps['descItemAlign'] || 'left'"
          :class-name="field.preps['descItemClassName'] || ''"
          :span="field.preps['descItemSpan'] || 1"
          :label-class-name="field.preps['descItemLabelClassName'] || ''"
        >
          <template #label>
            <div class="splitter-panel-header" v-if="isDesign">
              <span
                v-if="editingId !== item.fieldName"
                class="editable-name"
                @dblclick.stop="startEditName(item)"
                >{{ item.label }}</span
              >
              <el-input
                v-else
                class="descriptions-edit-input"
                v-model="editingText"
                size="small"
                @blur="finishEditName(item)"
                @keyup.enter="finishEditName(item)"
                @click.stop
                style="width: 120px"
              />
            </div>
          </template>
          <DesignItemWrapper
            :field="item"
            :isDesign="isDesign"
            :parentField="field"
            :disabled="disabled"
          >
            <component
              :field="getItem(item)"
              :isDesign="isDesign"
              :disabled="disabled"
              :showFormItem="showFormItem"
              :formInfo="formInfo"
              :is="itemCheck(item)"
              :parentField="field"
              v-model:formData="formData"
            />
          </DesignItemWrapper>
        </el-descriptions-item>
      </template>
    </el-descriptions>

    <!-- 设计模式: 拖拽区域(始终可拖入,放在descriptions下方) -->
    <div v-if="isDesign" class="desc-design-bottom">
      <div class="quick-add-bar">
        <el-button
          size="small"
          type="info"
          plain
          @click.stop="quickAddItem(field.preps.elements[0].items, true)"
          icon="Plus"
        >
          {{ i18n("dyform.condition.addLeaf") }}
        </el-button>
      </div>
    </div>
  </group-container>
</template>

<style lang="scss" scoped>
.desc-empty-design {
  min-height: 40px;
  min-width: 100px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.desc-design-bottom {
  margin-top: 8px;
  padding: 4px;
  border: 1px dashed #e4e7ed;
  border-radius: 4px;
}

.desc-design {
  min-height: 30px;
  padding: 4px;
}

.dragging-area {
  background: #f4f4f5;
  outline: 2px dashed #909399;
  outline-offset: -2px;
  border-radius: 4px;
}

.quick-add-bar {
  display: flex;
  justify-content: center;
  padding: 4px 0;
  margin-top: 4px;

  &:hover {
    background: #f4f4f5;
  }
}

:deep(.el-form-item__label) {
  padding: 0 !important;
}
</style>
