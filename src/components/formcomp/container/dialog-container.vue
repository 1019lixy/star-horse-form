<script setup lang="ts" name="dialog-container">
import {onMounted, PropType, ref} from "vue";
import {itemCheck} from "star-horse-lowcode";
import {getDesignFormStore} from "@/store/StoreManager";
import {i18n} from "@/lang";
import {quickAddItem} from "@/api/form_utils";
import DesignItemWrapper from "@/components/formcomp/utils/DesignItemWrapper.vue";
import GroupContainer from "@/components/formcomp/container/group-container.vue";
import {isContainer, ensureDefaultElements} from "./container-types";
import {useDragAdd, ensureItems, usePanelState} from "./container-utils";

const props = defineProps({
  parentField: {type: Object as PropType<any>},
  isDesign: {type: Boolean, default: false},
  showFormItem: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  formInfo: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
});
let designForm = getDesignFormStore();
const formData = defineModel("formData");
const {onDragAdd} = useDragAdd(designForm);
const checkItem = (adata: any) => ensureItems(adata);
const {visible: dialogVisible, tempFormData, handleOpen, handleClose} = usePanelState(formData, () => props.field);

onMounted(() => {
  ensureDefaultElements(props.field, "dialog");
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
    <!-- 触发按钮(设计模式和运行模式都显示) -->
    <div class="dialog-trigger" :class="{ 'design-mode': isDesign }">
      <el-button
          :type="field.preps['btnType'] || 'primary'"
          :icon="field.preps['btnIcon'] || undefined"
          @click="handleOpen"
          :disabled="disabled"
      >
        {{ field.preps['btnText'] || i18n('dyform.container.dialogDefaultBtn') }}
      </el-button>
    </div>

    <!-- 设计模式: 内嵌拖拽区域(始终可见,用于拖入字段) -->
    <div v-if="isDesign" class="dialog-design-area">
      <div class="design-area-title">
        <star-horse-icon icon-class="component" size="14px"/>
        <span>{{ i18n('dyform.container.innerFields') }}</span>
      </div>
      <draggable
          v-for="adata in field['preps']['elements']"
          :key="adata.subTablePrimaryKey"
          @add="(evt: Event) => onDragAdd(evt, adata['items'])"
          @dragover="checkItem(adata)"
          class="dialog-design"
          :class="{ 'dragging-area': designForm.isDragging }"
          group="starHorseGroup"
          animation="100"
          item-key="id"
          ghostClass="ghost"
          v-model="adata['items']"
      >
        <template #item="{ element: item }">
          <div class="comp-item" :data-field-id="item.id">
            <DesignItemWrapper :field="item" :isDesign="isDesign" :parentField="field" :disabled="disabled">
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
        <el-button size="small" type="info" plain @click.stop="quickAddItem(field.preps.elements[0].items)" icon="Plus">
          {{ i18n("dyform.condition.addLeaf") }}
        </el-button>
      </div>
    </div>

    <!-- 对话框(设计模式和运行模式都可以打开) -->
    <star-horse-panel
        v-model="dialogVisible"
        :title="field.preps['dialogTitle'] || field.preps['btnText'] || i18n('dyform.container.dialogDefaultBtn')"
        :boxWidth="field.preps['boxWidth'] || '50%'"
        :selfFunc="true"
        :close-on-click-modal="field.preps['closeOnClickModal'] !== undefined ? field.preps['closeOnClickModal'] : false"
        :close-on-press-escape="field.preps['closeOnPressEscape'] !== undefined ? field.preps['closeOnPressEscape'] : true"
        :show-close="field.preps['showClose'] !== undefined ? field.preps['showClose'] : true"
        :modal="field.preps['modal'] !== undefined ? field.preps['modal'] : true"
        :fullscreen="field.preps['fullscreen'] || false"
        :draggable="field.preps['draggable'] || false"
        :center="field.preps['center'] || false"
        :top="field.preps['top'] || '15vh'"
        append-to-body
        :destroy-on-close="field.preps['destroyOnClose'] !== undefined ? field.preps['destroyOnClose'] : true"
        @merge="handleClose"
        @closeAction="handleClose"
    >
      <div class="dialog-content">
        <template v-for="adata in field['preps']['elements']" :key="adata.subTablePrimaryKey">
          <draggable
              v-if="isDesign"
              @add="(evt: Event) => onDragAdd(evt, adata['items'])"
              @dragover="checkItem(adata)"
              class="dialog-inner-design"
              :class="{ 'dragging-area': designForm.isDragging }"
              group="starHorseGroup"
              animation="100"
              item-key="id"
              ghostClass="ghost"
              v-model="adata['items']"
          >
            <template #item="{ element: item }">
              <div class="comp-item" :data-field-id="item.id">
                <DesignItemWrapper :field="item" :isDesign="isDesign" :parentField="field" :disabled="disabled">
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
            <DesignItemWrapper v-for="item in adata['items']" :key="item.id" :field="item" :isDesign="false" :parentField="field" :disabled="disabled">
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
          <el-button size="small" type="info" plain @click.stop="quickAddItem(field.preps.elements[0].items)" icon="Plus">
            {{ i18n("dyform.condition.addLeaf") }}
          </el-button>
        </div>
      </div>
    </star-horse-panel>
  </group-container>
</template>

<style lang="scss" scoped>
.dialog-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;

  &.design-mode {
    padding: 8px;
    background: linear-gradient(135deg, #f0f9ff 0%, #fafbfc 100%);
    border: 1px dashed #d0e8ff;
    border-radius: 6px;
  }
}

.dialog-design-area {
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

.dialog-design {
  min-height: 60px;
  padding: 8px;
}

.dialog-inner-design {
  min-height: 60px;
  padding: 4px;
}

.dragging-area {
  background: #ecf5ff;
  outline: 2px dashed #409eff;
  outline-offset: -2px;
}

.quick-add-bar {
  display: flex;
  justify-content: center;
  padding: 4px 0;
  margin-top: 4px;
  border-top: 1px dashed #d9ecff;

  &:hover {
    background: #ecf5ff;
  }
}

.dialog-content {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
