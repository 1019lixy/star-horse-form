<script setup lang="ts" name="ItemPropertiesPanel">
import {computed, nextTick, onMounted, PropType, ref, watch} from "vue";
import {i18n} from "@/lang";
import {getDesignFormStore} from "@/store/StoreManager";
import {searchMatchList, SelectOption, StarHorseIcon,} from "star-horse-lowcode";
import ItemPropertiesPanel from "@/components/system/items/form/ItemPropertiesPanel.vue";
import CustomerPropertyPanel from "@/components/system/items/form/CustomerPropertyPanel.vue";
import FormInfoPanel from "@/components/system/items/form/FormInfoPanel.vue";
import {FormConfig} from "@/components/types";

const props = defineProps({
  optional: { type: Object as PropType<FormConfig> },
});
let designForm = getDesignFormStore();
const currentId = computed(() => designForm.currentItemId);
const currentComp = computed(() => designForm.currentComp);
let prepActiveName = ref<string>("base");
const customerPropertyPanelRef = ref();
let matchTypeList = ref<SelectOption[]>();
const panelDialogVisible = ref(false);
const dialogPrepActiveName = ref<string>("base");
const changeOperation = (val: string) => {
  if (val === "customer") {
    nextTick(() => {
      customerPropertyPanelRef.value?.assignPrep();
    });
  }
};
const openPanelDialog = () => {
  dialogPrepActiveName.value = prepActiveName.value;
  panelDialogVisible.value = true;
};
onMounted(async () => {
  matchTypeList.value = searchMatchList();
});
watch(
  () => currentId.value,
  (newVal) => {
    if (newVal && prepActiveName.value == "customer") {
      changeOperation("customer");
    }
  },
);
</script>

<template>
  <div class="property-panel-root">
    <!-- Tab Content -->
    <div class="property-tabs-content">
      <el-scrollbar class="property-scrollbar">
        <item-properties-panel
          v-if="prepActiveName === 'base'"
          :optional="optional"
        />
        <customer-property-panel
          v-if="prepActiveName === 'customer'"
          ref="customerPropertyPanelRef"
          :optional="optional"
        />
        <form-info-panel v-if="prepActiveName === 'formInfo'" />
      </el-scrollbar>
    </div>

    <!-- Tab Header (竖排右侧) -->
    <div class="property-tabs-header">
      <button
        :class="['property-tab', { active: prepActiveName === 'formInfo' }]"
        @click="
          prepActiveName = 'formInfo';
          changeOperation('base');
        "
      >
        <star-horse-icon iconClass="form" size="14px" />
        <span>{{ i18n("dyform.propPanel.formInfo") }}</span>
      </button>
      <button
        :class="['property-tab', { active: prepActiveName === 'base' }]"
        @click="
          prepActiveName = 'base';
          changeOperation('base');
        "
      >
        <star-horse-icon iconClass="base_preps" size="14px" />
        <span>{{ i18n("dyform.propPanel.baseProps") }}</span>
      </button>
      <!--||['box','dytable','gridtable'].includes(currentComp.itemType)-->
      <button
        v-if="currentComp?.compType == 'formItem'"
        :class="['property-tab', { active: prepActiveName === 'customer' }]"
        @click="
          prepActiveName = 'customer';
          changeOperation('customer');
        "
      >
        <star-horse-icon iconClass="data_db" size="14px" />
        <span>{{ i18n("dyform.propPanel.customProps") }}</span>
      </button>
      <button
        class="property-tab expand-btn"
        @click="openPanelDialog"
        :title="i18n('dyform.propPanel.expandPanel')"
      >
        <el-icon size="14px">
          <FullScreen />
        </el-icon>
      </button>
    </div>

    <!-- 弹窗打开当前面板 -->
    <star-horse-drawer
      v-model="panelDialogVisible"
      :title="
        dialogPrepActiveName === 'formInfo'
          ? i18n('dyform.propPanel.formInfo')
          : dialogPrepActiveName === 'customer'
            ? i18n('dyform.propPanel.customProps')
            : i18n('dyform.propPanel.baseProps')
      "
      :userAction="true"
      size="40%"
      @closeAction="panelDialogVisible = false"
    >
      <el-scrollbar class="dialog-scrollbar">
        <item-properties-panel
          v-if="dialogPrepActiveName === 'base'"
          :optional="optional"
          :inDialog="true"
        />
        <customer-property-panel
          v-if="dialogPrepActiveName === 'customer'"
          :optional="optional"
          :inDialog="true"
        />
        <form-info-panel v-if="dialogPrepActiveName === 'formInfo'" />
      </el-scrollbar>
    </star-horse-drawer>
  </div>
</template>

<style lang="scss" scoped>
.property-panel-root {
  height: 100%;
  display: flex;
  flex-direction: row;
  background: #ffffff;
  overflow: hidden;
}

/* ====== Tab Header (竖排右侧) ====== */
.property-tabs-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 6px;
  background: #f8f9fb;
  border-left: 1px solid #ebeef5;
  flex-shrink: 0;
  width: 52px;
}

.property-tab {
  width: 100%;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 4px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  color: #606266;
  transition: all 0.15s ease;
  white-space: normal;
  line-height: 1.2;
  text-align: center;

  :deep(.star-horse-icon) {
    font-size: 14px;
    color: inherit;
  }

  &:hover {
    background: #eef0f3;
    color: #303133;
  }

  &.active {
    background: #ffffff;
    color: #409eff;
    border-color: #e4e7ed;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    font-weight: 500;
  }
}

.all-props-btn {
  flex: 0 0 auto;
  padding: 6px 10px;
  color: #909399;
  border: 1px dashed #dcdfe6;

  &:hover {
    color: #409eff;
    border-color: #409eff;
    background: #ecf5ff;
  }
}

.expand-btn {
  flex: 0 0 auto;
  padding: 6px 8px;
  color: #909399;

  &:hover {
    color: #409eff;
    background: #ecf5ff;
  }
}

.dialog-scrollbar {
  height: 100%;

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }

}

/* ====== Content Area ====== */
.property-tabs-content {
  flex: 1;
  overflow: hidden;
}

.property-scrollbar {
  height: 100%;

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }
}


/* ====== Element Overrides ====== */
:deep(.el-collapse-item) {
  overflow: hidden;

  .el-collapse-item__wrap {
    height: 100%;
    overflow: hidden;

    .el-collapse-item__content {
      height: inherit;
      overflow: hidden;
    }
  }

  &:last-child {
    flex: 1;
    height: 100%;
  }
}

:deep(.el-scrollbar) {
  border-top-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  border-radius: 6px;
}

/* ====== Legacy classes (kept for compatibility) ====== */
.item-properties-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.properties-header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
}

.properties-content {
  flex: 1;
  overflow: hidden;
}

.widget-collapse {
  height: 99%;
}

.oper-btn {
  cursor: pointer;
}
</style>
