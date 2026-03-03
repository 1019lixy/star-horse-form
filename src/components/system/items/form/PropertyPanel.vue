<script setup lang="ts" name="ItemPropertiesPanel">
import {computed, onMounted, PropType, ref, watch} from "vue";
import {piniaInstance, searchMatchList, SelectOption, StarHorseIcon, useDesignFormStore,} from "star-horse-lowcode";
import ItemPropertiesPanel from "@/components/system/items/form/ItemPropertiesPanel.vue";
import CustomerPropertyPanel from "@/components/system/items/form/CustomerPropertyPanel.vue";
import {FormConfig} from "@/components/types";

const props = defineProps({
  optional: {type: Object as PropType<FormConfig>},
});
let designForm = useDesignFormStore(piniaInstance);
const formProps = computed(() => designForm.currentFormPreps);
const currentId = computed(() => designForm.currentItemId);
let prepActiveName = ref<string>("base");
let compSize = computed(() => props.optional?.compSize ?? "default");
const itemPropertiesRef = ref();
const customerPropertyPanelRef = ref();
let matchTypeList = ref<SelectOption[]>();
const changeOperation = (val: string) => {
  if (val === "customer") {
    customerPropertyPanelRef.value.assignPrep();
  }
};
onMounted(async () => {
  matchTypeList.value = searchMatchList();
});
watch(() => currentId.value, (newVal) => {
  if (newVal && prepActiveName.value == "customer") {
    changeOperation("customer");
  }
})
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <el-form
        :model="formProps"
        class="dynamic-form"
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
      <el-tabs
          v-model="prepActiveName"
          type="border-card"
          @tabChange="changeOperation"
      >
        <el-tab-pane label="基础属性" name="base">
          <template #label>
            <div class="flex items-center">
              <star-horse-icon iconClass="base_preps"/>
              基础属性
            </div>
          </template>
          <item-properties-panel :optional="optional"/>
        </el-tab-pane>
        <el-tab-pane name="customer">
          <template #label>
            <div class="flex items-center">
              <star-horse-icon iconClass="data_db"/>
              个性化属性
            </div>
          </template>
          <customer-property-panel
              ref="customerPropertyPanelRef"
              :optional="optional"
          />
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
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

  .component-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 13px;
    opacity: 0.9;
  }

  .component-icon {
    font-size: 16px;
  }
}

.properties-content {
  flex: 1;
  overflow: hidden;
}

.properties-form {
  padding: 16px;
}

.property-section {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;

  .section-header {
    background: #f5f7fa;
    padding: 12px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:hover {
      background: #ecf5ff;
    }

    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }

    .section-actions {
      display: flex;
      gap: 8px;
    }
  }

  .section-content {
    padding: 16px;
    background: white;
  }
}

.property-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.property-item {
  display: flex;
  flex-direction: column;

  .property-label {
    font-size: 13px;
    color: #606266;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 4px;

    .required {
      color: #f56c6c;
    }
  }

  .property-control {
    flex: 1;
  }
}

.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px;
  border-top: 1px solid #ebeef5;
  background: #fafafa;
}

.action-button {
  flex: 1;
  min-width: 120px;

  &:hover {
    transform: translateY(-1px);
  }
}

.empty-properties {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  color: #909399;
  text-align: center;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    color: #c0c4cc;
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 500;
    color: #606266;
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
  }
}

// Responsive design
@media (max-width: 768px) {
  .property-group {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    flex-direction: column;

    .action-button {
      width: 100%;
    }
  }
}

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

:deep(.el-form-item__content) {
  width: 90%;
  margin-left: 5px;
  padding-left: 5px;
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

.widget-collapse {
  height: 99%;
}

.oper-btn {
  cursor: pointer;
}

.dynamic-form {
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

:deep(.el-tabs) {
  overflow: auto !important;
}
</style>
