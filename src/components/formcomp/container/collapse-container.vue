<script setup lang="ts" name="collapse-container">
import {computed, onMounted, PropType, ref, watch, nextTick} from "vue";
import {getDesignFormStore, itemCheck, uuid} from "star-horse-lowcode";
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
    const input = document.querySelector(`.collapse-edit-input input`) as HTMLInputElement;
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


const activeTabName = ref();
onMounted(() => {
  if (!props.field["preps"]) {
    props.field["preps"] = {};
  }
  if (!props.field["preps"]?.["elements"]) {
    props.field["preps"]["elements"] = [
      {
        label: "Collapse1",
        tabName: "collapse1",
        objectName: "collapse1",
        subFormFlag: "Y",
        items: [],
      },
      {
        label: "Collapse2",
        tabName: "collapse2",
        objectName: "collapse2",
        subFormFlag: "Y",
        items: [],
      },
    ];
  }
  activeTabName.value = props.field["preps"]["elements"][0].tabName;
});
watch(
    () => activeTabName.value,
    (val) => {
      props.field["activeItemName"] = val;
      designForm.setCurrentSubTabName(val);
    },
    {immediate: true, deep: true},
);
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
    <el-collapse
        v-model="activeTabName"
        class="collapse-container"
        :accordion="field.preps['accordion']"
    >
      <el-collapse-item
          v-for="adata in field['preps']['elements']"
          :name="adata.tabName"
      >
        <template #title>
          <div class="collapse-item-title title">
            <span
              v-if="editingId !== (adata.tabName || adata.objectName)"
              class="editable-name"
              @dblclick.stop="startEditName(adata)"
            >{{ adata.label || adata.objectName }}</span>
            <el-input
              v-else
              class="collapse-edit-input"
              v-model="editingText"
              size="small"
              @blur="finishEditName(adata)"
              @keyup.enter="finishEditName(adata)"
              @click.stop
              style="width: 120px;"
            />
          </div>
        </template>
        <draggable
            @add="(evt: Event) => onDragAdd(evt, adata['items'])"
            @dragover="checkItem(adata)"
            class="card-design"
            :class="{ 'dragging-area': isDragging }"
            group="starHorseGroup"
            animation="100"
            :item-key="uuid()"
            ghostClass="ghost"
            :list="adata['items']"
        >
          <template #item="{ element: data }">
            <div class="comp-item  my-[5px]">
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
      </el-collapse-item>
    </el-collapse>
  </group-container>
</template>
<style lang="scss" scoped>
:deep(.el-card) {
  margin-top: 10px;
}

:deep(.el-card__body) {
  margin-top: 5px;
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
