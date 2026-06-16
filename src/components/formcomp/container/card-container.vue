<script setup lang="ts" name="card-container">
import {computed, onMounted, PropType, ref, nextTick} from "vue";
import {getDesignFormStore, itemCheck, uuid, fieldCopy} from "star-horse-lowcode";
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
let containerType: Array<string> = [
  "tab",
  "box",
  "table",
  "card",
  "dytable",
  "collapse",
];

const isContainer = (data: any) => {
  return containerType.includes(data.itemType);
};

// 双击编辑相关
const editingId = ref<string>("");
const editingText = ref<string>("");

const startEditName = (element: any) => {
  if (!props.isDesign) return;
  editingId.value = element.tabName || element.objectName;
  editingText.value = element.label || "";
  nextTick(() => {
    const input = document.querySelector(`.card-edit-input input`) as HTMLInputElement;
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
 * @param type
 */
const checkItem = (adata: any, type: string) => {
  if (type == "header") {
    if (!adata["headerFieldList"]) {
      adata["headerFieldList"] = [];
    }
  } else {
    if (!adata["items"]) {
      adata["items"] = [];
    }
  }
};
const onDragAdd = (evt: Event | any, dataList: any) => {
  console.log(evt, dataList);
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
        label: "Card",
        tabName: "card",
        objectName: "card",
        subFormFlag: "Y",
        headerFieldList: [],
        items: [],
      },
    ];
    props.field["stretch"] = "N";
  }
  activeTabName.value = 0;
  designForm.setCurrentSubTabName(activeTabName.value);
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
    <el-card
        class="card-container"
        :shadow="field.preps['shadow']"
        v-for="adata in field['preps']['elements']"
    >
      <template #header>
        <div class="card-header flex items-center justify-between max-h-[50px]">
          <div class="w-[60%] flex items-center gap-1">
            <span
              v-if="editingId !== (adata.tabName || adata.objectName)"
              class="editable-name"
              @dblclick.stop="startEditName(adata)"
            >{{ adata.title || adata.label || adata.tabName }}</span>
            <el-input
              v-else
              class="card-edit-input"
              v-model="editingText"
              size="small"
              @blur="finishEditName(adata)"
              @keyup.enter="finishEditName(adata)"
              @click.stop
              style="width: 120px;"
            />
            <help v-if="adata.helpMsg" :message="adata.helpMsg"/>
          </div>
          <div
              class="flex-1 min-h-[40px]"
              :class="{ 'dragging-area': isDragging }"
          >
            <draggable
                @add="(evt: Event) => onDragAdd(evt, adata['headerFieldList'])"
                @dragover="checkItem(adata, 'header')"
                class="card-design"
                group="starHorseGroup"
                animation="100"
                item-key="id"
                ghostClass="ghost"
                v-model="adata['headerFieldList']"
            >
              <template #item="{ element: header }">
                <div
                    class="comp-item my-[5px]"
                    :data-field-id="header.id"
                    :style="{ marginTop: isContainer(header) ? '25px' : '10px' }"
                >
                  <component
                      :key="header.id"
                      :field="header"
                      :isDesign="isDesign"
                      :showFormItem="showFormItem"
                      :disabled="disabled"
                      :formInfo="formInfo"
                      :is="itemCheck(header)"
                      :parentField="field"
                      v-model:formData="formData"
                  />
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </template>

      <draggable
          @add="(evt: Event) => onDragAdd(evt, adata['items'])"
          @dragover="checkItem(adata, 'body')"
          class="card-design"
          :class="{ 'dragging-area': isDragging }"
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

      <!-- 快捷添加组件按钮 -->
      <div v-if="isDesign" class="quick-add-bar">
        <el-button size="small" type="info" plain @click.stop="quickAddItem(adata.items)" icon="Plus">
          {{ i18n("dyform.condition.addLeaf") }}
        </el-button>
      </div>
    </el-card>
  </group-container>
</template>
<style lang="scss" scoped>
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
