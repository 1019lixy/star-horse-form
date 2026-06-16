<script setup lang="ts">
import {computed, nextTick, onMounted, PropType, ref} from "vue";

import GroupContainer from "@/components/formcomp/container/group-container.vue";
import JSON5 from "json5";
import {getDesignFormStore, itemCheck, uuid} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {quickAddItem} from "@/api/form_utils";

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

// 双击编辑相关
const editingId = ref<string>("");
const editingText = ref<string>("");

const startEditName = (element: any) => {
  if (!props.isDesign) return;
  editingId.value = element.tabName || element.objectName;
  editingText.value = element.label || "";
  nextTick(() => {
    const input = document.querySelector(`.splitter-edit-input input`) as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  });
};

const finishEditName = (element: any) => {
  if (editingText.value.trim()) {
    element.label = editingText.value.trim();
  }
  editingId.value = "";
};

/**
 * 如果没有items，动态添加
 * @param adata
 */
const checkItem = (adata: any) => {
  if (!adata["items"]) {
    adata["items"] = [];
  }
};
const onDragAdd = (evt: Event | any, dataList: any) => {
  let newIndex = evt.newIndex;
  if (newIndex != null && newIndex != "undefined") {
    let dataInfo = dataList[newIndex];
    designForm.selectItem(dataInfo, dataInfo.itemType, "");
  }
};


const checkData = (adata: any) => {
  if (adata.preps) {
    let temp = adata.preps;
    if (typeof temp == "string") {
      try {
        temp = JSON5.parse(adata.preps);
      } catch (e) {
        console.log(e);
      }
    }
    return {
      size: temp.size,
      min: temp.min,
      max: temp.max,
      resizable: temp.resizable,
      collapsible: temp.collapsible,
    };
  }
  return {};
};
onMounted(() => {
  if (!props.field["preps"]) {
    props.field["preps"] = {};
  }
  if (!props.field["preps"]?.["elements"]) {
    props.field["preps"]["elements"] = [
      {
        label: "Splitter1",
        tabName: "splitter1",
        objectName: "splitter1",
        subFormFlag: "Y",
        items: [],
        preps: "{}",
      },
      {
        label: "Splitter2",
        tabName: "splitter2",
        objectName: "splitter2",
        subFormFlag: "Y",
        items: [],
        preps: "{}",
      },
    ];
  }
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
              v-if="editingId !== (adata.tabName || adata.objectName)"
              class="editable-name"
              @dblclick.stop="startEditName(adata)"
          >{{ adata.label || adata.objectName }}</span>
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
