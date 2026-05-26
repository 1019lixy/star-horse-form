<script setup lang="ts" name="condition-container">
import {computed, nextTick, onMounted, PropType, ref} from "vue";
import {getDesignFormStore, itemCheck, operationConfirm, uuid,} from "star-horse-lowcode";
import GroupContainer from "@/components/formcomp/container/group-container.vue";
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
const currentItemId = computed(() => designForm.currentItemId);
const formData = defineModel("formData");

const isEdit = computed(() => props.isDesign);

// 双击编辑相关
const editingId = ref<string>("");
const editingText = ref<string>("");

onMounted(() => {
  if (!props.field["preps"]) {
    props.field["preps"] = {};
  }
  if (!props.field["children"]) {
    props.field["children"] = [];
  }
  /*  if (!props.field["items"]) {
      props.field["items"] = [];
    }*/
});

const selectData = () => {
  let container = props.field;
  designForm.setParentContainer(props.parentField);
  designForm.selectItem(container, container?.itemType, "");
};

const onDragAdd = (evt: Event | any, dataList: any) => {
  let newIndex = evt.newIndex;
  if (newIndex != null && newIndex != "undefined") {
    let dataInfo = dataList[newIndex];
    designForm.selectItem(dataInfo, dataInfo.itemType, "");
  }
};

const checkItem = (adata: any) => {
  if (!adata["children"]) {
    adata["children"] = [];
  }
};

// 创建子条件节点
const createChildNode = (index: number) => {
  return {
    id: "Id" + uuid(),
    label: i18n("dyform.condition.childCondition") + (index + 1),
    fieldName: "condition_" + uuid().substring(0, 6),
    listVisible: true,
    formVisible: true,
    type: "group",
    compType: "container",
    itemType: "condition",
    children: [],
  };
};

// 添加子条件节点
const addChildCondition = () => {
  if (!props.field.children) {
    props.field.children = [];
  }
  const newChild = createChildNode(props.field.children.length);
  props.field.children.push(newChild);
};

// 添加叶子字段节点
const addLeafField = (child: any) => {
  if (!child.children) {
    child.children = [];
  }
  quickAddItem(child.children);
};


// 删除叶子节点
const removeLeaf = (items: any[], index: number) => {
  if (items[index]?.compType == "container") {
    operationConfirm(i18n("dyform.condition.confirmDeleteChild")).then((res: boolean) => {
      if (res) {
        items.splice(index, 1);
      }
    });
  } else {
    items.splice(index, 1);
  }
};

// 双击编辑名称
const startEditName = (node: any) => {
  if (!props.isDesign) return;
  editingId.value = node.id;
  editingText.value = node.preps?.label || node.label || "";
  nextTick(() => {
    const el = document.querySelector(`[data-edit-id="${node.id}"] input`) as HTMLInputElement;
    if (el) {
      el.focus();
      el.select();
    }
  });
};

const finishEditName = (node: any) => {
  if (editingText.value.trim()) {
    node.label = editingText.value.trim();
    if (node.preps) {
      node.preps.label = editingText.value.trim();
    }
  }
  editingId.value = "";
};

// 层级缩进样式
const levelClass = (data: any, depth: number) => {
  return data.itemType == "condition" ? `condition-depth-${Math.min(depth, 5)} condition-child` : "";
};
</script>

<template>
  <group-container
      class="star-horse-form-container condition-container"
      :showFormItem="showFormItem"
      :isDesign="isDesign"
      :disabled="disabled"
      :parentField="parentField"
      :form-item="field"
  >
    <div class="condition-wrapper">
      <!-- 条件组标题栏 -->
      <div class="condition-header" @click.stop="selectData">
        <div class="condition-title">
          <svg class="condition-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
               stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span
              v-if="editingId !== field.id"
              class="condition-label editable-name"
              @dblclick.stop="startEditName(field)"
          >{{ field.preps?.label || field.label || i18n("dyform.condition.defaultLabel") }}</span>
          <el-input
              v-else
              :data-edit-id="field.id"
              v-model="editingText"
              size="small"
              @blur="finishEditName(field)"
              @keyup.enter="finishEditName(field)"
              @click.stop
              style="width: 120px;"
          />
        </div>
        <div class="condition-actions" v-if="isEdit && isDesign">
          <el-tooltip :content="i18n('dyform.condition.addLeaf')">
            <el-button
                size="small"
                type="primary"
                link
                @click.stop="addLeafField(field)"
                icon="Plus"
            />
          </el-tooltip>
          <el-tooltip :content="i18n('dyform.condition.addChild')">
            <el-button
                size="small"
                type="primary"
                link
                @click.stop="addChildCondition"
                icon="FolderAdd"
            />
          </el-tooltip>
        </div>
      </div>

      <!-- 条件内容区域 -->
      <div class="condition-body">
        <!-- 直接子项（叶子节点） -->
        <draggable
            @add="(evt: Event) => onDragAdd(evt, field.children)"
            @dragover="checkItem(field)"
            class="condition-leaves"
            :class="{'dragging-area': isDragging}"
            group="starHorseGroup"
            animation="100"
            :item-key="uuid()"
            ghostClass="ghost"
            :list="field.children || []"
        >
          <template #item="{ element: data, index }">
            <div class="condition-leaf-item my-[3px]" :class="levelClass(data,1)">
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
              <el-button
                  v-if="isEdit && isDesign"
                  class="leaf-remove-btn"
                  size="small"
                  type="danger"
                  link
                  @click.stop="removeLeaf(field.children, index)"
                  icon="Close"
              />
            </div>
          </template>
        </draggable>

        <!-- 添加叶子节点按钮 -->
        <div v-if="isEdit && isDesign" class="condition-add-leaf">
          <el-button
              size="small"
              type="info"
              plain
              @click.stop="addLeafField(field)"
              icon="Plus"
          >
            {{ i18n("dyform.condition.addLeaf") }}
          </el-button>
        </div>

        <!-- 嵌套子条件组 - 使用独立的SFC递归组件 -->
        <!--        <div
                  v-for="(child, childIndex) in field?.children"
                  :key="child.id"
                  class="condition-child"
                  :class="levelClass(1)"
                >
                  <condition-node
                    :node="child"
                    :depth="1"
                    v-if="child.type=='condition'"
                    :isDesign="isDesign"
                    :isEdit="isEdit"
                    :disabled="disabled"
                    :formInfo="formInfo"
                    :parentField="field"
                    :showFormItem="showFormItem"
                    v-model:formData="formData"
                    @remove="removeChild(field.children, childIndex)"
                  />
                </div>-->
      </div>
    </div>
  </group-container>
</template>

<style lang="scss" scoped>
.condition-wrapper {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.condition-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  cursor: pointer;
  user-select: none;

  .condition-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
  }

  .condition-icon {
    flex-shrink: 0;
  }

  .condition-actions {
    display: flex;
    gap: 2px;

    :deep(.el-button) {
      color: #fff !important;

      &:hover {
        color: #ffd700 !important;
      }
    }
  }
}

.condition-body {
  padding: 8px;
}

.condition-leaves {
  min-height: 32px;
  border-radius: 4px;
  transition: background 0.2s;
}

.condition-leaf-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover .leaf-remove-btn {
    opacity: 1;
  }

  .leaf-remove-btn {
    opacity: 0;
    transition: opacity 0.2s;
    flex-shrink: 0;
  }
}

.condition-add-leaf {
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

.condition-child {
  margin-top: 8px;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.2s;
}

.editable-name {
  cursor: text;
  border-bottom: 1px dashed transparent;
  transition: border-color 0.2s;

  &:hover {
    border-bottom-color: rgba(255, 255, 255, 0.5);
  }
}

.condition-depth-1 {
  border: 1px solid #b3d8ff;
  background: #f0f7ff;
}

.condition-depth-2 {
  border: 1px solid #b3e8c9;
  background: #f0fff4;
}

.condition-depth-3 {
  border: 1px solid #f3d19e;
  background: #fffbf0;
}

.condition-depth-4 {
  border: 1px solid #f3b4b4;
  background: #fff5f5;
}

.condition-depth-5 {
  border: 1px solid #d3b3f3;
  background: #f9f0ff;
}

.dragging-area {
  background: linear-gradient(45deg, #e6f7ff 25%, transparent 25%),
  linear-gradient(-45deg, #e6f7ff 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, #e6f7ff 75%),
  linear-gradient(-45deg, transparent 75%, #e6f7ff 75%);
  background-size: 20px 20px;
  background-position: 0 0,
  0 10px,
  10px -10px,
  -10px 0px;
}

.ghost {
  opacity: 0.5;
  background: #c8e6c9;
}
</style>
