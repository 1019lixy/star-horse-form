<script setup lang="ts" name="drawer-container">
import {onMounted, PropType} from "vue";
import {itemCheck} from "star-horse-lowcode";
import {getDesignFormStore} from "@/store/StoreManager";
import {i18n} from "@/lang";
import {quickAddItem} from "@/api/form_utils";
import DesignItemWrapper from "@/components/formcomp/utils/DesignItemWrapper.vue";
import {ensureDefaultElements} from "./container-types";
import {ensureItems, useDragAdd, usePanelState} from "./container-utils";

const props = defineProps({
  parentField: { type: Object as PropType<any> },
  isDesign: { type: Boolean, default: false },
  showFormItem: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  formInfo: { type: Object as PropType<any> },
  field: { type: Object as PropType<any> },
});
let designForm = getDesignFormStore();
const formData = defineModel("formData");
const { onDragAdd } = useDragAdd(designForm);
const checkItem = (adata: any) => ensureItems(adata);
const {
  visible: drawerVisible,
  tempFormData,
  handleOpen,
  handleClose,
} = usePanelState(formData, () => props.field);

onMounted(() => {
  ensureDefaultElements(props.field, "drawer");
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
    <!-- 触发按钮 -->
    <div class="dialog-trigger" :class="{ 'design-mode': isDesign }">
      <el-button
        :type="field.preps['btnType'] || 'primary'"
        :icon="field.preps['btnIcon'] || undefined"
        @click="handleOpen"
        :disabled="disabled"
      >
        {{
          field.preps["btnText"] || i18n("dyform.container.drawerDefaultBtn")
        }}
      </el-button>
    </div>

    <!-- 设计模式: 内嵌拖拽区域 -->
    <div v-if="isDesign" class="drawer-design-area">
      <div class="design-area-title">
        <star-horse-icon icon-class="component" size="14px" />
        <span>{{ i18n("dyform.container.innerFields") }}</span>
      </div>
      <draggable
        v-for="adata in field['preps']['elements']"
        :key="adata.subTablePrimaryKey"
        @add="(evt: Event) => onDragAdd(evt, adata['items'])"
        @dragover="checkItem(adata)"
        class="drawer-design"
        :class="{ 'dragging-area': designForm.isDragging }"
        group="starHorseGroup"
        animation="100"
        item-key="id"
        ghostClass="ghost"
        v-model="adata['items']"
      >
        <template #item="{ element: item }">
          <div class="comp-item" :data-field-id="item.id">
            <DesignItemWrapper
              :field="item"
              :isDesign="isDesign"
              :parentField="field"
              :disabled="disabled"
            >
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
            </DesignItemWrapper>
          </div>
        </template>
      </draggable>
      <div v-if="isDesign" class="quick-add-bar">
        <el-button
          size="small"
          type="info"
          plain
          @click.stop="quickAddItem(field.preps.elements[0].items)"
          icon="Plus"
        >
          {{ i18n("dyform.condition.addLeaf") }}
        </el-button>
      </div>
    </div>

    <!-- 抽屉(设计模式和运行模式都可以打开) -->
    <star-horse-panel
      type="drawer"
      v-model="drawerVisible"
      :title="
        field.preps['drawerTitle'] ||
        field.preps['btnText'] ||
        i18n('dyform.container.drawerDefaultBtn')
      "
      :direction="field.preps['direction'] || 'rtl'"
      :size="field.preps['drawerSize'] || '40%'"
      :selfFunc="true"
      :modal="field.preps['modal'] !== undefined ? field.preps['modal'] : true"
      :close-on-click-modal="
        field.preps['closeOnClickModal'] !== undefined
          ? field.preps['closeOnClickModal']
          : true
      "
      :close-on-press-escape="
        field.preps['closeOnPressEscape'] !== undefined
          ? field.preps['closeOnPressEscape']
          : true
      "
      :show-close="
        field.preps['showClose'] !== undefined ? field.preps['showClose'] : true
      "
      :with-header="
        field.preps['withHeader'] !== undefined
          ? field.preps['withHeader']
          : true
      "
      @merge="handleClose"
      @close="handleClose"
    >
      <div class="drawer-content">
        <template
          v-for="adata in field['preps']['elements']"
          :key="adata.subTablePrimaryKey"
        >
          <draggable
            v-if="isDesign"
            @add="(evt: Event) => onDragAdd(evt, adata['items'])"
            @dragover="checkItem(adata)"
            class="drawer-inner-design"
            :class="{ 'dragging-area': designForm.isDragging }"
            group="starHorseGroup"
            animation="100"
            item-key="id"
            ghostClass="ghost"
            v-model="adata['items']"
          >
            <template #item="{ element: item }">
              <div class="comp-item" :data-field-id="item.id">
                <DesignItemWrapper
                  :field="item"
                  :isDesign="isDesign"
                  :parentField="field"
                  :disabled="disabled"
                >
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
                </DesignItemWrapper>
              </div>
            </template>
          </draggable>
          <template v-else>
            <DesignItemWrapper
              v-for="item in adata['items']"
              :key="item.id"
              :field="item"
              :isDesign="false"
              :parentField="field"
              :disabled="disabled"
            >
              <component
                :field="item"
                :isDesign="false"
                :disabled="disabled"
                :showFormItem="showFormItem"
                :formInfo="formInfo"
                :is="itemCheck(item)"
                :parentField="field"
                v-model:formData="formData"
              />
            </DesignItemWrapper>
          </template>
        </template>
        <div v-if="isDesign" class="quick-add-bar">
          <el-button
            size="small"
            type="info"
            plain
            @click.stop="quickAddItem(field.preps.elements[0].items)"
            icon="Plus"
          >
            {{ i18n("dyform.condition.addLeaf") }}
          </el-button>
        </div>
      </div>
    </star-horse-panel>
  </group-container>
</template>

<style lang="scss" scoped>
.drawer-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;

  &.design-mode {
    padding: 8px;
    background: linear-gradient(135deg, #f0f9eb 0%, #fafbfc 100%);
    border: 1px dashed #d0e8b8;
    border-radius: 6px;
  }
}

.drawer-design-area {
  margin-top: 8px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}

.design-area-title {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #f5f7fa;
  font-size: 12px;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
}

.drawer-design {
  min-height: 60px;
  padding: 8px;
}

.drawer-inner-design {
  min-height: 60px;
  padding: 4px;
}

.dragging-area {
  background: #f0f9eb;
  outline: 2px dashed #67c23a;
  outline-offset: -2px;
}

.quick-add-bar {
  display: flex;
  justify-content: center;
  padding: 4px 0;
  margin-top: 4px;
  border-top: 1px dashed #d0e8b8;

  &:hover {
    background: #f0f9eb;
  }
}

.drawer-content {
  padding: 0 4px;
}
</style>
