<script setup lang="ts" name="condition-node">
import {computed, nextTick, PropType, ref} from "vue";
import {getDesignFormStore, itemCheck, operationConfirm, uuid} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {quickAddItem} from "@/api/form_utils";

defineOptions({name: "ConditionNode"});

const props = defineProps({
  node: {type: Object as PropType<any>, required: true},
  depth: {type: Number, default: 1},
  isDesign: {type: Boolean, default: false},
  isEdit: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  formInfo: {type: Object as PropType<any>},
  parentField: {type: Object as PropType<any>},
  showFormItem: {type: Boolean, default: false},
  formData: {type: Object as PropType<any>},
});

const emit = defineEmits(["remove", "update:formData"]);

const designForm = getDesignFormStore();
const isDragging = computed(() => designForm.isDragging);

// 双击编辑相关
const editingId = ref<string>("");
const editingText = ref<string>("");

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
    items: [],
  };
};

const addLeafField = (child: any) => {
  if (!child.children) {
    child.children = [];
  }
  quickAddItem(child.children);
};

const addChildToNode = (node: any) => {
  if (!node.children) {
    node.children = [];
  }
  const newChild = createChildNode(node.children.length);
  node.children.push(newChild);
};

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

const removeChild = (childList: any[], index: number) => {
  operationConfirm(i18n("dyform.condition.confirmDeleteChild")).then((res: boolean) => {
    if (res) {
      childList.splice(index, 1);
    }
  });
};

const levelClass = (data: any, depth: number) => {
  return data.itemType == "condition" ? `condition-depth-${Math.min(depth, 5)} condition-child` : "";
};

// 双击编辑名称
const startEditName = (node: any) => {
  if (!props.isDesign) return;
  editingId.value = node.id;
  editingText.value = node.label || "";
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
</script>

<template>
  <div class="condition-node-wrapper">
    <div class="condition-child-header">
      <div class="condition-child-title">
        <svg class="condition-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
             stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <span
            v-if="editingId !== node.id"
            class="editable-name"
            @dblclick.stop="startEditName(node)"
        >{{ node.label || i18n('dyform.condition.childCondition') }}</span>
        <el-input
            v-else
            :data-edit-id="node.id"
            v-model="editingText"
            size="small"
            @blur="finishEditName(node)"
            @keyup.enter="finishEditName(node)"
            @click.stop
            style="width: 120px;"
        />
      </div>
      <div class="condition-child-actions" v-if="isEdit && isDesign">
        <el-tooltip :content="i18n('dyform.condition.addLeaf')">
          <el-button size="small" type="primary" link @click.stop="addLeafField(node)" icon="Plus"/>
        </el-tooltip>
        <el-tooltip :content="i18n('dyform.condition.addChild')">
          <el-button size="small" type="success" link @click.stop="addChildToNode(node)" icon="FolderAdd"/>
        </el-tooltip>
        <el-tooltip :content="i18n('dyform.condition.deleteChild')">
          <el-button size="small" type="danger" link @click.stop="$emit('remove')" icon="Delete"/>
        </el-tooltip>
      </div>
    </div>

    <draggable
        @add="(evt: Event) => onDragAdd(evt, node.children)"
        @dragover="checkItem(node)"
        class="condition-leaves"
        :class="{'dragging-area': isDragging}"
        group="starHorseGroup"
        animation="100"
        item-key="id"
        ghostClass="ghost"
        :list="node.children || []"
    >
      <template #item="{ element: data, index }">
        <div class="condition-leaf-item my-[3px]"
             :data-field-id="data.id"
             :class="levelClass(data,depth + 1)">
          <component
              :key="data.id"
              :field="data"
              :isDesign="isDesign"
              :disabled="disabled"
              :showFormItem="showFormItem"
              :formInfo="formInfo"
              :is="itemCheck(data)"

              :parentField="parentField"
              :formData="formData"
              @update:formData="$emit('update:formData', $event)"
          />
          <el-button
              v-if="isEdit && isDesign"
              class="leaf-remove-btn"
              size="small"
              type="danger"
              link
              @click.stop="removeLeaf(node.children, index)"
              icon="Close"
          />
        </div>
      </template>
    </draggable>

    <div v-if="isEdit && isDesign" class="condition-add-leaf">
      <el-button size="small" type="info" plain @click.stop="addLeafField(node)" icon="Plus">
        {{ i18n('dyform.condition.addLeaf') }}
      </el-button>
    </div>

    <!--    <div
          v-for="(grandChild, grandChildIndex) in node.children"
          :key="grandChild.id"
          class="condition-child"
          :class="levelClass(depth + 1)"
        >
          <condition-node
            :node="grandChild"
            :depth="depth + 1"
            :isDesign="isDesign"
            :isEdit="isEdit"
            v-if="grandChild.type=='condition'"
            :disabled="disabled"
            :formInfo="formInfo"
            :parentField="parentField"
            :showFormItem="showFormItem"
            :formData="formData"
            @update:formData="$emit('update:formData', $event)"
            @remove="removeChild(node.children, grandChildIndex)"
          />
        </div>-->
  </div>
</template>

<style lang="scss" scoped>
.condition-node-wrapper {
  border-radius: 6px;
  overflow: hidden;
}

.condition-child-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;

  .condition-child-title {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .condition-child-actions {
    display: flex;
    gap: 2px;
  }
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

  .condition-child-header {
    background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
    color: #fff;
  }
}

.condition-depth-2 {
  border: 1px solid #b3e8c9;
  background: #f0fff4;

  .condition-child-header {
    background: linear-gradient(135deg, #67c23a 0%, #529b2e 100%);
    color: #fff;
  }
}

.condition-depth-3 {
  border: 1px solid #f3d19e;
  background: #fffbf0;

  .condition-child-header {
    background: linear-gradient(135deg, #e6a23c 0%, #b88230 100%);
    color: #fff;
  }
}

.condition-depth-4 {
  border: 1px solid #f3b4b4;
  background: #fff5f5;

  .condition-child-header {
    background: linear-gradient(135deg, #f56c6c 0%, #c45656 100%);
    color: #fff;
  }
}

.condition-depth-5 {
  border: 1px solid #d3b3f3;
  background: #f9f0ff;

  .condition-child-header {
    background: linear-gradient(135deg, #9b59b6 0%, #7d3c98 100%);
    color: #fff;
  }
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
