<script setup lang="ts" name="descriptions-container">
import {computed, nextTick, onMounted, PropType, ref} from "vue";
import {getDesignFormStore, itemCheck, warning} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {quickAddItem} from "@/api/form_utils";
import GroupContainer from "@/components/formcomp/container/group-container.vue";

const props = defineProps({
  parentField: {type: Object as PropType<any>},
  isDesign: {type: Boolean, default: false},
  showFormItem: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  formInfo: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
});
let designForm = getDesignFormStore();
let draggingItem = computed(() => designForm.draggingItem);
const formData = defineModel("formData");
let containerType: Array<string> = [
  "tab", "box", "table", "card", "dytable", "collapse", "splitter", "step", "condition",
  "dialog", "drawer", "fieldset", "descriptions", "anchor",
];
const isContainer = (data: any) => containerType.includes(data.itemType);

const onDragAdd = (evt: Event | any, dataList: any) => {
  let newIndex = evt.newIndex;
  console.log(draggingItem.value);
  if (isContainer(draggingItem.value.itemType)) {
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
    console.log(dataInfo);
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
    const input = document.querySelector(`.descriptions-edit-input input`) as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  });
};

const finishEditName = (element: any) => {
  if (editingText.value.trim()) {
    element.preps.label = editingText.value.trim();
  }
  editingId.value = "";
};
const checkItem = (adata: any) => {
  if (!adata["items"]) adata["items"] = [];
};

// 获取所有items(合并所有element的items)
const allItems = () => {
  const elements = props.field?.preps?.elements || [];
  let items: any[] = [];
  elements.forEach((el: any) => {
    if (el.items) items = items.concat(el.items);
  });
  return items;
};

onMounted(() => {
  if (!props.field["preps"]) props.field["preps"] = {};
  if (!props.field["preps"]?.["elements"]) {
    props.field["preps"]["elements"] = [
      {label: "Descriptions", tabName: "descriptions", objectName: "descriptions", subFormFlag: "Y", items: []},
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
    <el-descriptions
        :title="field.preps['descTitle'] || ''"
        :direction="field.preps['direction'] || 'horizontal'"
        :column="field.preps['column'] || 3"
        :border="field.preps['border'] !== false"
        :size="field.preps['size'] || 'default'"
        :extra="field.preps['descExtra'] || ''"
        :label-width=" field.preps['descItemLabelWidth'] || ''"
    >
      <template v-for="adata in field['preps']['elements']" :key="adata.tabName">
        <el-descriptions-item
            v-for="item in adata['items']"
            :key="item.id"
            :label="item.preps?.label || item.fieldName"
            :rowspan=" field.preps['descItemRowspan'] || 1"
            :align=" field.preps['descItemAlign'] || 'left'"
            :class-name=" field.preps['descItemClassName'] || ''"
            :span="field.preps['descItemSpan'] || 1"
            :label-class-name=" field.preps['descItemLabelClassName'] || ''"
        >
          <template #label>
            <div class="splitter-panel-header" v-if="isDesign">
          <span
              v-if="editingId !== (item.fieldName)"
              class="editable-name"
              @dblclick.stop="startEditName(item)"
          >{{ item.label || item.objectName }}</span>
              <el-input
                  v-else
                  class="descriptions-edit-input"
                  v-model="editingText"
                  size="small"
                  @blur="finishEditName(item)"
                  @keyup.enter="finishEditName(item)"
                  @click.stop
                  style="width: 120px;"
              />
            </div>
          </template>
          <component
              :field="item"
              :isDesign="isDesign"
              :disabled="disabled"
              :showFormItem="showFormItem"
              :formInfo="formInfo"
              :is="itemCheck(item)"
              :parentField="field"
              v-model:formData="formData"
          />
        </el-descriptions-item>
      </template>
    </el-descriptions>

    <!-- 设计模式: 拖拽区域(始终可拖入,放在descriptions下方) -->
    <div v-if="isDesign" class="desc-design-bottom">
      <div class="quick-add-bar">
        <el-button size="small" type="info" plain @click.stop="quickAddItem(field.preps.elements[0].items,true)"
                   icon="Plus">
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
