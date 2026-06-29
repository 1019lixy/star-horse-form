<script setup lang="ts" name="ItemPropertiesPanel">
import {computed, nextTick, onMounted, PropType, ref, watch} from "vue";
import {i18n} from "@/lang";
import {getDesignFormStore, searchMatchList, SelectOption, StarHorseIcon,} from "star-horse-lowcode";
import ItemPropertiesPanel from "@/components/system/items/form/ItemPropertiesPanel.vue";
import CustomerPropertyPanel from "@/components/system/items/form/CustomerPropertyPanel.vue";
import {FormConfig} from "@/components/types";

const props = defineProps({
  optional: {type: Object as PropType<FormConfig>},
});
let designForm = getDesignFormStore();
const formProps = computed(() => designForm.currentFormPreps);
const currentId = computed(() => designForm.currentItemId);
let prepActiveName = ref<string>("base");
let compSize = computed(() => props.optional?.compSize ?? "default");
const itemPropertiesRef = ref();
const customerPropertyPanelRef = ref();
let matchTypeList = ref<SelectOption[]>();
const changeOperation = (val: string) => {
  if (val === "customer") {
    nextTick(()=>{
      customerPropertyPanelRef.value?.assignPrep();
    });

  }
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
    <!-- Tab Header -->
    <div class="property-tabs-header">
      <button
          :class="['property-tab', { active: prepActiveName === 'base' }]"
          @click="prepActiveName = 'base'; changeOperation('base')"
      >
        <star-horse-icon iconClass="base_preps" size="14px"/>
        <span>{{ i18n('dyform.propPanel.baseProps') }}</span>
      </button>
      <button
          :class="['property-tab', { active: prepActiveName === 'customer' }]"
          @click="prepActiveName = 'customer'; changeOperation('customer')"
      >
        <star-horse-icon iconClass="data_db" size="14px"/>
        <span>{{ i18n('dyform.propPanel.customProps') }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="property-tabs-content">
      <el-scrollbar class="property-scrollbar">
        <el-form
            :model="formProps"
            class="property-form"
            ref="itemPropertiesRef"
            :size="compSize"
            :scroll-to-error="true"
            :scroll-into-view-options="true"
            :inline-message="false"
            :status-icon="true"
            label-width="auto"
            label-position="right"
            require-asterisk-position="right"
        >
          <item-properties-panel v-if="prepActiveName === 'base'" :optional="optional"/>
          <customer-property-panel
              v-if="prepActiveName === 'customer'"
              ref="customerPropertyPanelRef"
              :optional="optional"
          />
        </el-form>
      </el-scrollbar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.property-panel-root {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  overflow: hidden;
}

/* ====== Tab Header (segment style) ====== */
.property-tabs-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #f8f9fb;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.property-tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  transition: all 0.15s ease;
  white-space: nowrap;
  line-height: 1.2;

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

.property-form {
  padding: 12px;
  width: 100%;

  :deep(.el-form-item) {
    margin-bottom: 14px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(.el-form-item__label) {
    font-size: 13px;
    color: #606266;
    padding-right: 8px;
  }

  :deep(.el-form-item__content) {
    width: 90%;
    margin-left: 5px;
    padding-left: 5px;
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
