<script setup lang="ts">
import {insertBelowRow, insertRightCol,} from "@/components/formcomp/container/dytableUtils";
import {i18n} from "@/lang";

import {computed, PropType, ref, watch} from "vue";
import {
  copyContainer,
  dynamicFormContextMenuData,
  fieldCopy,
  FieldList,
  getDesignFormStore,
  operationConfirm,
  StarHorseDialog
} from "star-horse-lowcode";

const props = defineProps({
  isDesign: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  parentField: {type: Object as PropType<any>},
  formItem: {type: Object, required: true},
});
let designForm = getDesignFormStore();
let compList = computed(() => designForm.compList);
let currentItemId = computed(() => designForm.currentItemId);
let componentVisible = computed(() => {
  return (
      designForm.componentVisible &&
      currentItemId.value == props.formItem?.preps.id
  );
});
let isEdit = computed(() => props.isDesign);

// ── Collapse/Expand ──
const collapsed = ref(false);
const toggleCollapse = (e: Event) => {
  e.stopPropagation();
  collapsed.value = !collapsed.value;
};

// Auto-expand when a child component is selected (e.g. from outline)
const containsItemId = (container: any, targetId: string): boolean => {
  if (!targetId || !container) return false;
  const elements = container.preps?.elements || [];
  for (const el of elements) {
    for (const item of el.items || []) {
      if ((item.preps?.id || item.id) === targetId) return true;
      if (item.itemType && containsItemId(item, targetId)) return true;
    }
    for (const item of el.headerFieldList || []) {
      if ((item.preps?.id || item.id) === targetId) return true;
    }
    for (const col of el.columns || []) {
      for (const item of col.items || []) {
        if ((item.preps?.id || item.id) === targetId) return true;
        if (item.itemType && containsItemId(item, targetId)) return true;
      }
    }
  }
  for (const child of container.children || []) {
    if ((child.preps?.id || child.id) === targetId) return true;
    if (child.itemType && containsItemId(child, targetId)) return true;
  }
  return false;
};

watch(currentItemId, (newId) => {
  if (collapsed.value && newId && containsItemId(props.formItem, newId)) {
    collapsed.value = false;
  }
});
const containerLabel = computed(() => {
  const labels: Record<string, string> = {
    tab: "选项卡", box: "栅格", table: "表格", card: "卡片",
    dytable: "动态表格", collapse: "折叠", splitter: "分割", condition: "条件",
  };
  return labels[props.formItem?.itemType] || "容器";
});

const selectData = () => {
  let container = props.formItem;
  designForm.setParentContainer(props.parentField);
  designForm.selectItem(container, container?.itemType, "");
};
const removeData = () => {
  operationConfirm(i18n("dyform.comp.container.440")).then((res) => {
    if (res) {
      let id = props.formItem.preps?.id || props.formItem.id;
      let parentType = props.parentField?.itemType;
      if (parentType == "tab" || parentType == "card" || parentType == "collapse") {
        // These containers store items in elements[i].items
        let elements = props.parentField!.preps.elements;
        for (let i = 0; i < elements.length; i++) {
          let items = elements[i].items;
          for (let j = 0; j < items.length; j++) {
            let itemId = items[j]?.preps?.id || items[j]?.id;
            if (id === itemId) {
              items.splice(j, 1);
              return;
            }
          }
        }
      } else if (parentType == "box" || parentType == "dytable" || parentType == "table") {
        // These containers store items in elements[i].columns[j].items
        let elements = props.parentField!.preps.elements;
        for (let i = 0; i < elements.length; i++) {
          let columns = elements[i].columns;
          if (!columns) continue;
          for (let j = 0; j < columns.length; j++) {
            let items = columns[j].items;
            for (let k = 0; k < items.length; k++) {
              let itemId = items[k]?.preps?.id || items[k]?.id;
              if (id === itemId) {
                items.splice(k, 1);
                return;
              }
            }
          }
        }
      } else {
        // Top-level container in compList
        let dataList = compList.value;
        for (let i = 0; i < dataList.length; i++) {
          let itemId = dataList[i].preps?.id || dataList[i].id;
          if (id === itemId) {
            dataList.splice(i, 1);
            return;
          }
        }
      }
    }
  });
};
const containerContextMenuRef = ref();
const containerContextMenu = (evt: MouseEvent | any) => {
  if (!isEdit.value) return;
  evt.stopPropagation();
  evt.preventDefault();
  evt.props = props;
  // 右键时先选中当前容器，确保"添加组件"弹窗等后续操作正常工作
  designForm.selectItem(props.formItem, props.formItem.itemType, "");
  containerContextMenuRef.value?.show(evt);
};
const close = () => {
  designForm.setComponentVisible(false);
};
const addItem = (item: any) => {
  let type = item.category == 2 ? "container" : "formItem";
  let data = fieldCopy(item, type);
  let itemType = props.formItem.itemType;
  let activeItemName = props.formItem.activeItemName;
  let elements = props.formItem.preps.elements;
  for (let index in elements) {
    let element = elements[index];
    if (activeItemName && activeItemName != element.tabName) {
      continue;
    }
    let columns = element.columns;
    if (!columns) {
      let items = element.items;
      if (itemType == "table") {
        if (items.length == 0) {
          items.push(data);
          return;
        }
      } else {
        items.push(data);
        return;
      }
    }
    for (let colIndex in columns) {
      let col = columns[colIndex];
      if (col.items.length == 0) {
        col.items.push(data);
        return;
      }
    }
  }
};
const tableOperation = (actonName: string, _preps: any) => {
  let preps = props.formItem.preps;
  if (!preps.elements) {
    preps["elements"] = [];
  }
  const itemType = props.formItem.itemType;
  if (actonName == "insertRow") {
    insertBelowRow(
        {
          parentField: props.formItem,
          rowIndex: preps.elements.length - 1,
        },
        itemType,
    );
  } else if (actonName == "insertCol") {
    if (props.formItem.itemType == "table") {
      preps.columns = (preps.columns || 1) + 1;
      return;
    }
    insertRightCol(
        {
          parentField: props.formItem,
          colIndex: preps.elements[0].columns.length - 1,
        },
        itemType,
        true,
    );

  } else if (actonName == "copy") {
    //拷贝容器
    copyContainer(props.parentField, props.formItem, false);
  }
};
</script>
<template>
  <star-horse-dialog
      box-width="450px"
      box-height="70%"
      :source="3"
      :full-screen="false"
      :title="i18n('form.addComponent')"
      :self-func="true"
      :dialog-visible="componentVisible"
      @closeAction="close"
  >
    <template #footer>
      <el-button type="primary" size="default" @click="close"
      >{{ i18n("form.confirm") }}
      </el-button>
    </template>
    <field-list @selectData="addItem"/>
  </star-horse-dialog>
  <div
      class="field-item"
      :class="{ 'container-collapsed': collapsed }"
      v-if="isEdit && isDesign"
      @contextmenu="containerContextMenu"
  >
    <!-- Collapse toggle button (always visible in design mode) -->
    <div class="collapse-toggle" @click.stop="toggleCollapse" :title="collapsed ? '展开' : '折叠'">
      <svg viewBox="0 0 16 16" fill="none" width="12" height="12" :class="{ 'rotated': collapsed }">
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <!-- Collapsed indicator (shown only when collapsed, click to expand) -->
    <div v-if="collapsed" class="collapsed-placeholder" @click.stop="toggleCollapse">
      <span class="collapsed-label">{{ containerLabel }}</span>
      <span class="collapsed-hint">已折叠 · 点击展开</span>
    </div>

    <!-- Container content (hidden when collapsed) -->
    <div v-show="!collapsed">
      <slot></slot>
    </div>

    <div class="drag-handler" v-if="isEdit && currentItemId == formItem.id && !collapsed">
      <el-tooltip :content="i18n('form.drag')">
        <star-horse-icon
            icon-class="drag"
            size="18px"
            style="color: var(--star-horse-white)"
        />
      </el-tooltip>
      <el-tooltip :content="i18n('form.selectContainer')">
        <star-horse-icon
            cursor="pointer"
            @click.stop="selectData"
            icon-class="select-parent"
            style="color: var(--star-horse-white)"
        />
      </el-tooltip>
      <el-tooltip :content="i18n('form.deleteContainer')">
        <star-horse-icon
            cursor="pointer"
            @click.stop="removeData"
            icon-class="clear-all"
            style="color: var(--star-horse-white)"
        />
      </el-tooltip>
    </div>
    <div class="field-action" v-if="isEdit && currentItemId == formItem.id && !collapsed">
      <template
          v-if="formItem.itemType == 'dytable' || formItem.itemType == 'box'"
      >
        <el-tooltip :content="i18n('form.insertRow')">
          <star-horse-icon
              @click.stop="tableOperation('insertRow', formItem?.preps)"
              icon-class="insert_row"
              cursor="pointer"
              style="color: var(--star-horse-white)"
          />
        </el-tooltip>
      </template>
      <template
          v-if="
          formItem.itemType == 'dytable' ||
          formItem.itemType == 'box' ||
          formItem.itemType == 'table'
        "
      >
        <el-tooltip :content="i18n('form.insertCol')">
          <star-horse-icon
              @click.stop="tableOperation('insertCol', formItem?.preps)"
              icon-class="insert_col"
              cursor="pointer"
              style="color: var(--star-horse-white)"
          />
        </el-tooltip>
      </template>
      <el-tooltip :content="i18n('form.copyContainer')">
        <star-horse-icon
            @click.stop="tableOperation('copy', formItem?.preps)"
            icon-class="copy"
            style="color: var(--star-horse-white)"
        />
      </el-tooltip>
    </div>
    <Teleport to="body">
      <ContentMenu
          ref="containerContextMenuRef"
          :menu-data="
          dynamicFormContextMenuData(formItem, parentField, 'container')
        "
      />
    </Teleport>
  </div>
  <div class="field-item" style="border: unset" v-else>
    <slot></slot>
  </div>
</template>
<style lang="scss" scoped>
.field-item {
  border: 1px dashed #e6a23c;
  position: relative;
}

/* ── Collapse/Expand ── */
.collapse-toggle {
  position: absolute;
  top: 1px;
  right: 1px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  color: #909399;
  z-index: 200;
  padding: 0;
  backdrop-filter: blur(4px);

  svg {
    transition: transform 0.15s ease;

    &.rotated {
      transform: rotate(-90deg);
    }
  }

  &:hover {
    color: #409eff;
    background: #ecf5ff;
    border-color: #b3d8ff;
  }
}

.collapsed-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 32px 8px 12px;
  background: rgba(230, 162, 60, 0.04);
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    background: rgba(230, 162, 60, 0.08);
  }
}

.collapsed-label {
  font-size: 12px;
  color: #e6a23c;
  font-weight: 500;
}

.collapsed-hint {
  font-size: 11px;
  color: #c0c4cc;
}

.container-collapsed {
  border-style: dashed;
  border-color: #f0d9a8;
  min-height: auto !important;
}

.el-form-item {
  position: relative;

  :deep(.el-form-item__label) {
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  span.custom-label .icon-cls {
    margin: 0 3px;
  }

  :deep(.hide-spin-button) input::-webkit-outer-spin-button,
  :deep(.hide-spin-button) input::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
  }

  :deep(.hide-spin-button) input[type="number"] {
    -moz-appearance: textfield;
  }
}

.required :deep(.el-form-item__label)::before {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}

.static-content-item {
  min-height: 20px;
  display: flex;
  /* 垂直居中 */
  align-items: center;

  /* 垂直居中 */
  :deep(.el-divider--horizontal) {
    margin: 0;
  }
}

.el-form-item.selected,
.static-content-item.selected {
  outline: 2px solid var(--star-horse-style);
}

:deep(.label-left-align) .el-form-item__label {
  text-align: left;
  justify-content: flex-start !important;
}

:deep(.label-center-align) .el-form-item__label {
  text-align: center;
  justify-content: center !important;
}

:deep(.label-right-align) .el-form-item__label {
  text-align: right;
  justify-content: flex-end !important;
}
</style>
